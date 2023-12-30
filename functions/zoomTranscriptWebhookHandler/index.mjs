import crypto from "crypto";

import { duplicateEventCheck } from "./utilities/debounceCheck.mjs";
import { getSecret } from "./utilities/getSecret.mjs";
import { downloadURL } from "./utilities/downloadURL.mjs";
import { transformVTT } from "./utilities/parseVTT.mjs";
import { analyzerChain } from "./utilities/sendToOpenAI.mjs";
import { sendToSlack } from "./utilities/sendToSlack.mjs";

// secret & key names to retreieve keys from AWS Secrets Manager
const zoomWebhookSecretName = "dev/zoom-webhook/api-key";

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const body = JSON.parse(event.body);
  console.log("body", body);

  const webhookTokenResponse = await getSecret(zoomWebhookSecretName);
  const webhookToken = webhookTokenResponse.ZOOM_WEBHOOK_SECRET_TOKEN;

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

  if (body.event === "recording.transcript_completed") {
    try {
      const isDuplicate = await duplicateEventCheck(body.payload.object.uuid);
      if (isDuplicate) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Duplicate event detected, ignoring",
          }),
        };
      }

      // get the recording transcript file array
      const files = body.payload.object.recording_files;

      // get the download token - used as access_token in the download url
      const downloadToken = body.download_token;

      // Send files array + download token to downloadURL function
      // + get the text from the transcript
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

      // parse the VTT transcript file content to prep for OpenAI prompt
      const parsedTranscript = transformVTT(transcriptFile);
      console.log("parsedTranscript", parsedTranscript);

      // send the parsed transcript to OpenAI analyzer chain
      const openAIResult = await analyzerChain(parsedTranscript);
      console.log("result", openAIResult);

      // send the result of the openAI prompt + the meeting topic to a Slack Channel
      await sendToSlack(openAIResult.text, body.payload.object.topic);

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
