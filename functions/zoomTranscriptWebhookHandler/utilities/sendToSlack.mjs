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
