import { zodToJsonSchema } from "zod-to-json-schema";

import { schema } from "../models/recipe";
import { TAGS } from "../constants";

const json = zodToJsonSchema(schema);

const EXTRACTION_PROMPT = `
I need you to parse this webpage and extract the recipe information into the following JSON format:

Schema:
\`\`\`
${JSON.stringify(json)}
\`\`\`

`;

const TAGS_PROMPT = (recipe: string) => `
Given the recipe JSON, I need you to give me a list of tags that describe the recipe. Return them in a JSON array. Use only the tags:
${TAGS.join(", ")}

Here is the JSON:
${recipe}
`;

export { EXTRACTION_PROMPT, TAGS_PROMPT };
