import fs from "fs";

const generateBuiltString = (asArray, asMap) =>
  `export default {
    asArray: ${asArray},
    asMap: ${asMap}
}`;

(() => {
  const files = fs.readdirSync("lib");
  console.log("Reading...");
  const recipes = files.map((file) =>
    JSON.parse(fs.readFileSync(`lib/${file}`))
  );

  console.log("Building array...");
  const asArray = JSON.stringify(recipes);

  console.log("Building map...");
  const asMap = JSON.stringify(
    recipes.reduce((acc, recipe) => {
      acc[recipe.slug] = recipe;

      return acc;
    }, {})
  );

  console.log("Building bundle...");
  fs.writeFileSync("index.js", generateBuiltString(asArray, asMap));

  console.log("Built!");
})();
