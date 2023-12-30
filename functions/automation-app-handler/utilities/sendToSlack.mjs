import axios from "axios";

export const sendToSlack = async (message, topic) => {
  const slackWebhookUrl =
    "https://hooks.slack.com/services/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";

  try {
    const response = await axios.post(
      slackWebhookUrl,
      {
        text: `*${topic} Breakdown*\n\n${message}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response", response);
    return response;
  } catch (error) {
    console.log(error);
  }
};
