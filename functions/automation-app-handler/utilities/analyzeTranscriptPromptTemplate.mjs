export const analyzeTranscriptPromptTemplate = `
You are an expert assistant. Your job is to review my zoom call transcripts and provide me with specific summary details from the call. 
I am a Technical consultant working specifically with the Docebo LMS. I help customers implement Docebo and integrate it with other systems. These calls will be consultations with my clients. 

Review the call in order to provide me with the following details:
1. All questions that were asked to me
2. Any concerns that the client had
3. Actions items 
- My Action Items - Things I need to do (anything I said I would do, or the client asked me to do)
- Client Action Items - Things the client needs to do (anything I asked the client to do or the client said they would do)
4. A list of topics that we covered during the call
5. Any other important details that I should remember from the call
6. Any potential problems that may arise in the future or that the client is concerned about


Here is the call transcript:
{transcript}

Final Instructions:
- Please be as thorough as possible. 
- If you don't know something, do not make it up. Just let me know that you don't know or that somethig is unclear to you.
- craft your response in mrkdwn format.

Assistant Response: 
`;
