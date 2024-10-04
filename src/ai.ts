import OpenAI from "openai";
import { MainContent } from "./scrape";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EXTRACTION_PROMPT = `
I need you to parse this webpage and extract the instructions, ingredients, and title, image url, and any other important information necessary for creating this recipe. Do not include any messaging, only respond in JSON
`.trim();

const ogMetadataToString = (ogMetadata: Record<string, string>): string => {
  return Object.entries(ogMetadata)
    .map(([key, value]) => {
      return `${key}: ${value}`;
    })
    .join("\n");
};

const getRecipeFromHTML = async (
  content: MainContent,
): Promise<string | null> => {
  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: ogMetadataToString(content.ogMetadata) },
      { role: "user", content: content.body },
    ],
    model: "gpt-4o",
  });

  return chatCompletion.choices[0].message.content;
};

export { getRecipeFromHTML };
