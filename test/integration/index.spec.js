const { expect } = require("@jest/globals");
const fs = require("fs");

describe("Integration", () => {
  let files, recipes;

  beforeEach(() => {
    files = fs.readdirSync("lib");
    recipes = files.map((file) => JSON.parse(fs.readFileSync(`lib/${file}`)));
  });

  test("README.md should exist", () => {
    expect("README.md").shouldExistInFilesystem();
  });

  test("scraped recipes should match schema", () => {
    recipes.forEach((recipe) => {
      expect(recipe).toBeARecipe();
    });
  });

  test("should not have orphaned images", () => {
    const recipesImages = recipes
      .map((recipe) => recipe.image)
      .filter(Boolean)
      .map((imagePath) => imagePath.split("/").pop());
    const imageFiles = fs.readdirSync("images");

    imageFiles.forEach((file) => {
      expect(recipesImages).toContain(file);
    });
  });
});
