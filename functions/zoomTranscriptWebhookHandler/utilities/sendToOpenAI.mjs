import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

// import { getZoomSecret } from "./getZoomSecret.mjs";

import { analyzeTranscriptPromptTemplate } from "./analyzeTranscriptPromptTemplate.mjs";

const openaiSecretname = "meeting-analyzer/openai-key";

export const analyzerChain = async (transcript) => {
  try {
    // const openaiApiKeyResponse = await getZoomSecret(openaiSecretname);
    // const openAIApiKey = openaiApiKeyResponse.OPENAI_API_KEY;

    const llmOpenAI = new OpenAI({
      openAIApiKey: "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",
      modelName: "gpt-4-1106-preview",
      temperature: 0,
    });

    const prompt = new PromptTemplate({
      template: analyzeTranscriptPromptTemplate,
      inputVariables: ["transcript"],
    });

    const llmChain = new LLMChain({
      llm: llmOpenAI,
      prompt: prompt,
    });

    const result = await llmChain.call({
      transcript: transcript,
    });

    return result;
  } catch (error) {
    console.log(error);
  }
};
