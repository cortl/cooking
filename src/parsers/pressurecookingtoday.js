import * as Cheerio from "cheerio";

import * as Util from "./util";

const parse = async (source, notes, rating) => {
  const page = await Util.getPage(source);
  const $ = Cheerio.load(page);

  let select;
  const instructionBlock = $(".mv-create-instructions");
  select = Cheerio.load($(instructionBlock).html());
  const instructions = select("li")
    .map((_, element) => $(element).text())
    .get();

  const ingredientBlock = $(".mv-create-ingredients");
  select = Cheerio.load($(ingredientBlock).html());
  const ingredients = select("li")
    .map((_, element) => $(element).text())
    .get()
    .map((ingredient) => ingredient.split(" ").filter(Boolean).join(" "))
    .map((str) => str.replace(/[\t\n\r]/gm, ""));
  const title = $("h1").text();
  const slug = Util.createSlug(title);
  const imageUrl = $("img")
    .map((_, element) => $(element).attr("data-lazy-src"))
    .get()[0];
  const image = await Util.downloadImage(slug, source, imageUrl);
  const servings = $(".mv-create-yield")
    .text()
    .split(" ")
    .map((word) => parseInt(word))
    .find(Boolean);

  const time = $(".mv-create-time")
    .map((i, element) => {
      const label = $(element).find(".mv-create-time-label").text();
      const units = $(element).find("span.mv-time-part").text();
      return {
        label,
        units,
      };
    })
    .get();

  return {
    title,
    servings,
    time,
    slug,
    rating,
    image,
    notes: [notes],
    source: source,
    ingredients,
    instructions,
    createdDate: new Date().toLocaleDateString(),
  };
};

export { parse };
