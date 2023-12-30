# meeting-analyzer-workflow

This project contains source code and supporting files for a serverless application that you can deploy with the SAM CLI.

The Project contains a lambda function that reveives events through an api gateway. Incoming events are sent via a Zoom webhook when a meeting recording transcript is successfully generated for the specified Zoom account. The incoming payload contains information about that specific recording, including a download url where the transcript can be retreived from. The lambda function takes in this event, parses and formats the transcript, uses langchain npm package to pair the transcript with a prompt template and then sends it to the specified language model. Finally, the lambda function sends the ai response to the user in a slack channel. 

functions/zoomTranscriptWebhookHandler
index.mjs -- imports utilities and manages the automation flow
/utilities
- analyzeTranscriptPromptTemplate.mjs -- use case specific prompt template
- downloadURL.mjs -- use the download_url to retreive the transcript (VTT file) from zoom
- getZoomSecret.mjs
- parseVTT.mjs
- sendToOpenAI.mjs -- facilitates the langchain flow to send the prompt template to the specified language model
- sendToSlack.mjs
