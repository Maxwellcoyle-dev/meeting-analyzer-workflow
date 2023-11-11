import axios from "axios";

const clientId = "ZXZb4fV5R7yrXt0RWd1Ttw";
const clientSecret = "32gsj5YEk8J3IYVDjV25NlpJ37yX78KX";

// const getToken = async () => {
//   const response = await axios.post(
//     "https://zoom.us/oauth/token",
//     {},
//     {
//       params: {
//         grant_type: "client_credentials",
//       },
//       headers: {
//         Authorization: `Basic ${Buffer.from(
//           `${clientId}:${clientSecret}`
//         ).toString("base64")}`,
//       },
//     }
//   );

//   console.log("getToken response", response);
//   return response.data.access_token; // Use this token for authenticated requests
// };

export const downloadURL = async (files, downloadToken) => {
  console.log("files", files);

  // Find the transcript file
  const transcriptFile = files.find(
    (file) => file.file_type === "TRANSCRIPT" && file.file_extension === "VTT"
  );

  if (transcriptFile) {
    try {
      // Append your JWT token for authentication
      const downloadUrl = `${transcriptFile.download_url}?access_token=${downloadToken}`;

      // Download the VTT file content using axios with JWT token
      const response = await axios.get(downloadUrl, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // The VTT content will be a Buffer since we set `responseType` to 'arraybuffer'
      const vttContent = response.data.toString("utf-8");
      console.log("VTT Content:", vttContent);

      // TODO: Extract text from VTT content
      // You can now process the vttContent variable to extract the text

      // Return or process the extracted text as needed
      return vttContent;
    } catch (error) {
      console.error("Error downloading the transcript file:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to download transcript",
          error: error.message,
        }),
      };
    }
  } else {
    // No transcript file found
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Transcript file not found",
      }),
    };
  }
};
