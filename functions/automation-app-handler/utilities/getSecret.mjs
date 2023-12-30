import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: "us-east-2",
});

export const getSecret = async (secretName) => {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );

    const key = JSON.parse(response.SecretString);
    console.log("key", key);
    return key;
  } catch (err) {
    console.log(err);
    return err;
  }
};
