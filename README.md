# meeting-analyzer-workflow

This is a serverless application that can be deployed with the SAM CLI.

The Project contains a lambda function that reveives events through an api gateway. Incoming events are sent via a Zoom webhook when a meeting recording transcript is successfully generated for the specified Zoom account. The incoming payload contains information about that specific recording, including a download url where the transcript can be retreived from. The lambda function takes in this event, parses and formats the transcript, uses langchain npm package to pair the transcript with a prompt template and then sends it to the specified language model. Finally, the lambda function sends the ai response to the user in a slack channel. 

Requirements: 
- Zoom business account - cloud recording transcriptions enabled
- Zoom account permissions to create a webhook to listen for recording transcript events
- Slack workspace + a slack app with webhooks enabled + permission to post in a specific channel
- API access key for your chosen ai language model
- AWS User with permission to create and view lambdas, api gateway, dynamodb table, secret manager


The code lives here --> functions/zoomTranscriptWebhookHandler

index.mjs -- imports utilities and manages the automation flown

/utilities
- analyzeTranscriptPromptTemplate.mjs -- prompt template - engineered for specific use case
- analyzerChain.mjs -- facilitates the langchain flow to send the prompt template to the specified language model
- debounceCheck -- receives the zoom event_id - checks if the event_id exists in dynamodb table, if so returns isDuplicateEvent = true, if not save the event_id and return isDuplicateEvent = false
- downloadURL.mjs -- use the download_url + download_token to retreive the transcript (VTT file) from zoom
- getSecret.mjs -- Utility function that gets project secrets -- zoom webhook secret + language model ai secret 
- parseVTT.mjs -- parses the vtt into a formatted string
- sendToSlack.mjs -- Sends the analysis to a specified slack channel. Meeting topic included as a header
