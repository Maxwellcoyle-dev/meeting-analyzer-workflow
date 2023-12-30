import axios from "axios";

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
