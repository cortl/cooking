import fs from "fs";
import sharp from "sharp";

const recipeProcessors = {
  image: async (recipe) => {
    const { image } = recipe;
    if (!image) return;

    const imageFile = fs.readFileSync(`images/${image}`);
    const metadata = await sharp(imageFile).metadata();

    if (!metadata.height) return;
    if (!metadata.width) return;

    return {
      path: image,
      height: metadata.height,
      width: metadata.width,
    };
  },
};

(async () => {
  // Check if build dir exists
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
  }

  const files = fs.readdirSync("lib");
  console.log("Reading...");

  console.log("Processing recipes...");
  const recipes = await Promise.all(
    files.map(async (file) => {
      const recipe = JSON.parse(fs.readFileSync(`lib/${file}`));
      console.log(recipe);

      await Promise.all(
        Object.keys(recipe).map(async (key) => {
          if (recipeProcessors[key]) {
            const processor = recipeProcessors[key];
            const result = await processor(recipe);

            if (result) {
              recipe[key] = result;
            }
          }
        }),
      );

      return recipe;
    }),
  );

  console.log("Rewriting recipes...");
  recipes.forEach((recipe) =>
    fs.writeFileSync(`dist/${recipe.slug}.json`, JSON.stringify(recipe)),
  );

  console.log("Building bundle...");
  fs.writeFileSync("dist/index.json", JSON.stringify(recipes));

  console.log("Built!");
})();
