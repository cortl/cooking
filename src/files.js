import fs from "fs";
import path from "path";

let existingSites = {};

fs.readdirSync(path.normalize("lib")).forEach((item) => {
  const filePath = path.normalize(`lib/${item}`);
  const recipe = JSON.parse(fs.readFileSync(filePath));

  existingSites[recipe.source] = {
    title: recipe.title,
    slug: recipe.slug,
    image: recipe.image,
  };
});

const getExistingRecipe = (url) =>
  existingSites.hasOwnProperty(url) ? existingSites[url] : null;

export { getExistingRecipe };
