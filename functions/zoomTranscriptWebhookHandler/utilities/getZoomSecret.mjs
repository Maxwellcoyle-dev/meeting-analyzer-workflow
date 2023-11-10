import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "dev/zoom-webhook/api-key";
const client = new SecretsManagerClient({
  region: "us-east-2",
});

export const getZoomSecret = async () => {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
      })
    );

    const token = JSON.parse(response.SecretString).ZOOM_WEBHOOK_SECRET_TOKEN;
    return token;
  } catch (err) {
    console.log(err);
    return err;
  }
};
