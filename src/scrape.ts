import path from "node:path";
import fs from "node:fs";

import Axios from "axios";
import OpenAI from "openai";
import { format } from "date-fns/format";
import * as Cheerio from "cheerio";

import {
  EXTRACTION_PROMPT,
  RELATED_PROMPT,
  TAGS_PROMPT,
} from "./scraper/prompt";
import { getRecipeFromHTML } from "./ai";

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

const getRelated = async (recipe: string) => {
  const files = fs.readdirSync("lib");
  const slugs = files.map((file) => {
    const recipe = JSON.parse(fs.readFileSync(`lib/${file}`, "utf-8"));

    return recipe.slug;
  });

  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: "system", content: RELATED_PROMPT(recipe, slugs) }],
    model: "gpt-4o-mini",
  });

  const content = chatCompletion.choices[0].message.content ?? "";

  const json = extractJsonFromCode(content);

  return json;
};

type MainContent = {
  ogMetadata: Record<string, string>;
  body: string;
};

const getMainContentForPage = async (
  $: Cheerio.CheerioAPI,
): Promise<MainContent> => {
  // Extract Open Graph metadata
  const ogMetadata: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, element) => {
    const property = $(element).attr("property");
    const content = $(element).attr("content");

    if (property && content) {
      ogMetadata[property] = content;
    }
  });

  // Remove unnecessary tags
  $("body").find("script, style, iframe, nav, footer").remove();

  // Extract text content from specified elements
  const elementsToExtract = ["h1", "h2", "h3", "h4", "p", "li"];
  let bodyText = "";

  elementsToExtract.forEach((selector) => {
    $(selector).each((_, element) => {
      bodyText += $(element).text().trim() + " ";
    });
  });

  if (!bodyText) {
    throw new Error("No text content found in the specified elements");
  }

  return { ogMetadata, body: bodyText };
};

(async () => {
  // try {
  if (!url) {
    console.log("pass a url as an argument!");

    return;
  }

  console.log("Scraping URL:", url);
  const page = await Axios.get(url);
  console.log("\tDone");

  console.log("Extracting page data");
  const $ = Cheerio.load(page.data);

  console.log("Shrinking HTML");
  const data = await getMainContentForPage($);
  console.log("\tDone");

  console.log("Having GPT make a first pass");
  const response = await getRecipeFromHTML(data);
  console.log("\tDone");

  const extraction = await getFirstRecipeJson(response);

  console.log(JSON.stringify(extraction, null, 2));

  //   console.log("GPT tagging");
  //   const tags = await getTags(JSON.stringify(first));
  //   console.log("\tDone");

  //   // set date
  // first.createdDate = format(new Date(), "MM/dd/yyyy");

  //   // set tags
  //   first.tags = tags;

  //   // set URL
  //   first.source.url = url;

  //   try {
  //     console.log("GPT related");
  //     const related = await getRelated(JSON.stringify(first));

  //     // set related
  //     first.related = related;
  //     console.log("\tDone");
  //   } catch (err) {
  //     console.error("Error getting related recipes:", err);
  //   }

  //   console.log("\nImage:");
  //   const downloadedImage = `image${path.extname(first.image)}`;
  //   const finalImage = `${first.slug}.webp`;
  //   console.log(`curl ${first.image} > ${downloadedImage}`);
  //   console.log(`magick ${downloadedImage} images/${finalImage}`);
  //   first.image = finalImage;

  //   console.log("\nJSON:");
  //   console.log(JSON.stringify(first, null, 2));
  // } catch (err: unknown) {
  //   console.error("Error scraping URL:", err);
  // }
})();

export type { MainContent };
