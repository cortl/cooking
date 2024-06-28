import fs from "fs";
import { describe, test, before } from "node:test";
import assert from "assert";

import {
  shouldBeARecipe,
  shouldExistInFilesystem,
  arrayContains,
} from "../extensions.js";

describe("Integration", () => {
  let files, recipes;

  before(() => {
    files = fs.readdirSync("lib");
    recipes = files.map((file) => JSON.parse(fs.readFileSync(`lib/${file}`)));
  });

  test("README.md should exist", () => {
    shouldExistInFilesystem("README.md");
  });

  test("scraped recipes should match schema", () => {
    recipes.forEach((recipe) => {
      shouldBeARecipe(recipe);
    });
  });

  test("should not have orphaned images", () => {
    const recipesImages = recipes
      .map((recipe) => recipe.image)
      .filter(Boolean)
      .map((imagePath) => imagePath.split("/").pop());
    const imageFiles = fs.readdirSync("images");

    imageFiles.forEach((file) => {
      arrayContains(recipesImages, file);
    });
  });
});
