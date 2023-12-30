import crypto from "crypto";

import { duplicateEventCheck } from "./utilities/debounceCheck.mjs";
import { getSecret } from "./utilities/getSecret.mjs";
import { downloadURL } from "./utilities/downloadURL.mjs";
import { transformVTT } from "./utilities/parseVTT.mjs";
import { analyzerChain } from "./utilities/analyzerChain.mjs";
import { sendToSlack } from "./utilities/sendToSlack.mjs";

// secret & key names to retreieve keys from AWS Secrets Manager
const zoomWebhookSecretName = "dev/zoom-webhook/api-key";

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const body = JSON.parse(event.body);
  console.log("body", body);

  // Get the zoom webhook secret token from AWS Secrets Manager
  const webhookSecretToken = await getSecret(zoomWebhookSecretName);
  const webhookToken = webhookSecretToken.ZOOM_WEBHOOK_SECRET_TOKEN;

  // Validate the webhook using the webhook token
  if (body.event === "endpoint.url_validation") {
    const hashForValidate = crypto
      .createHmac("sha256", webhookToken)
      .update(body.payload.plainToken)
      .digest("hex");

    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plainToken: body.payload.plainToken,
        encryptedToken: hashForValidate,
      }),
    };

    return response;
  }

  // Handle the transcript completed event
  if (body.event === "recording.transcript_completed") {
    try {
      const isDuplicate = await duplicateEventCheck(body.payload.object.uuid);

      // If the event is a duplicate return 200
      if (isDuplicate) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Duplicate event detected, ignoring",
          }),
        };
      }

      // If the event is not a duplicate continue processing --> download the transcript file

      // get the recording transcript file array
      const files = body.payload.object.recording_files;

      // get the download token - used as access_token in the download url
      const downloadToken = body.download_token;

      // Send files + download_token to downloadURL function
      // In return get the transcript vtt file content
      const transcriptFile = await downloadURL(files, downloadToken);

      // If there is no transcript return 404
      if (!transcriptFile) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Transcript file not found",
          }),
        };
      }

      // parse the VTT transcript file content to prep for prompt template
      const parsedTranscript = transformVTT(transcriptFile);
      console.log("parsedTranscript", parsedTranscript);

      // send the parsed transcript to AI analyzer chain
      const aiResult = await analyzerChain(parsedTranscript);
      console.log("result", aiResult);

      // send the result of the openAI prompt to a Slack Channel
      // Include meeting topic for slack message header
      await sendToSlack(aiResult.text, body.payload.object.topic);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Transcript processed successfully",
        }),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
};
