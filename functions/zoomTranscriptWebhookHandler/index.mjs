import crypto from "crypto";

import { getZoomSecret } from "./utilities/getZoomSecret.mjs";
import { downloadURL } from "./utilities/downloadURL.mjs";

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const body = JSON.parse(event.body);
  console.log("body", body);

  const ZOOM_WEBHOOK_SECRET_TOKEN = await getZoomSecret();

  if (body.event === "endpoint.url_validation") {
    const hashForValidate = crypto
      .createHmac("sha256", ZOOM_WEBHOOK_SECRET_TOKEN)
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

    const response = await downloadURL(files);

    console.log("response", response);
  }
};
