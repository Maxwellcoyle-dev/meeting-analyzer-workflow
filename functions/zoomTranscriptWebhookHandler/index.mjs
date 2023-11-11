import crypto from "crypto";

import { getZoomSecret } from "./utilities/getZoomSecret.mjs";
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

  const webhookTokenResponse = await getZoomSecret(zoomWebhookSecretName);
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
    const files = body.payload.object.recording_files;
    console.log("files", files);

    const downloadToken = body.download_token;
    console.log("downloadToken", downloadToken);

    const transcriptFile = await downloadURL(files, downloadToken);

    if (!transcriptFile) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Transcript file not found",
        }),
      };
    }

    const parsedTranscript = transformVTT(transcriptFile);
    console.log("parsedTranscript", parsedTranscript);

    const openAIResult = await analyzerChain(parsedTranscript);
    console.log("result", openAIResult);

    try {
      await sendToSlack(openAIResult.text, body.payload.object.topic);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Transcript processed successfully",
      }),
    };
  }
};
