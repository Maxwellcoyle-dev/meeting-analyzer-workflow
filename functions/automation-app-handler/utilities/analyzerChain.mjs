import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

import { getSecret } from "./getSecret.mjs";

import { analyzeTranscriptPromptTemplate } from "./analyzeTranscriptPromptTemplate.mjs";

const openaiSecretname = "dev/meeting-analyzer/openai-key";

export const analyzerChain = async (transcript) => {
  try {
    const openaiApiKeyResponse = await getSecret(openaiSecretname);
    const openAIApiKey = openaiApiKeyResponse.OPENAI_API_KEY;

    const llmOpenAI = new OpenAI({
      openAIApiKey: openAIApiKey,
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
