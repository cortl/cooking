import path from "node:path";

import Axios from "axios";
import OpenAI from "openai";
import { format } from "date-fns/format";
import * as Cheerio from "cheerio";

import { EXTRACTION_PROMPT, TAGS_PROMPT } from "./scraper/prompt";

const hostToContentSelector: { [key: string]: string } = {
  "www.themediterraneandish.com": ".wprm-recipe-template-tmd-food",
};

const url = process.argv[2];

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const extractJsonFromCode = (code: string) => {
  const jsonString = code.match(/```json\n([\s\S]*?)\n```/);

  if (!jsonString) {
    throw new Error("Could not find JSON in response");
  }

  const json = JSON.parse(jsonString[1]);

  return json;
};

const getFirstRecipeJson = async (data: any) => {
  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: data },
    ],
    model: "gpt-4o-mini",
  });
  const content = chatCompletion.choices[0].message.content ?? "";
  const json = extractJsonFromCode(content);

  return json;
};

const getTags = async (recipe: string) => {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: "system", content: TAGS_PROMPT(recipe) }],
    model: "gpt-4o-mini",
  });

  const content = chatCompletion.choices[0].message.content ?? "";
  const json = extractJsonFromCode(content);

  return json;
};

const getMainContentForPage = async (url: string, $: Cheerio.CheerioAPI) => {
  const hostname = new URL(url).hostname;
  const selector = hostToContentSelector[hostname];

  if (!selector) {
    return $.html();
  }

  const content = $(selector);

  return content.html();
};

(async () => {
  try {
    if (!url) {
      console.log("pass a url as an argument!");

      return;
    }

    console.log("Scraping URL:", url);
    const page = await Axios.get(url);
    console.log("\tDone");

    console.log("Shrinking HTML");
    const $ = Cheerio.load(page.data);
    const content = await getMainContentForPage(url, $);
    console.log("\tDone");

    console.log("Having GPT make a first pass");
    const first = await getFirstRecipeJson(content);
    console.log("\tDone");

    console.log("GPT tagging");
    const tags = await getTags(JSON.stringify(first));
    console.log("\tDone");

    // set date
    first.createdDate = format(new Date(), "MM/dd/yyyy");

    // set tags
    first.tags = tags;

    // set URL
    first.source.url = url;

    console.log("\nJSON:");
    console.log(JSON.stringify(first, null, 2));

    console.log("\nImage:");
    const downloadedImage = `image${path.extname(first.image)}`;
    console.log(`curl ${first.image} > ${downloadedImage}`);
    console.log(`magick ${downloadedImage} images/${first.slug}.webp`);
  } catch (err: unknown) {
    console.error("Error scraping URL:", err);
  }
})();
