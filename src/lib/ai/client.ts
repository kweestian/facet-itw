import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

export const aiModel = openai("gpt-4o-mini");

export { streamText };

