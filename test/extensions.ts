import fs from "fs";
import assert from "assert";

import { schema } from "../src/models/recipe.ts";

const shouldExistInFilesystem = (path) => {
  const result = fs.existsSync(path);

  if (!result) {
    throw new assert.AssertionError({
      message: `${path} does not exist in filesystem`,
      actual: false,
      expected: true,
      operator: "existsSync",
    });
  }
};

const shouldBeARecipe = (recipe) => {
  const { title } = recipe;

  const { error } = schema.safeParse(recipe);

  if (error) {
    throw new assert.AssertionError({
      message: `${title}: ${error.message}`,
      actual: error.message,
      expected: "Valid Recipe",
      operator: "validate",
    });
  }
};

const arrayContains = (array, item) => {
  const contains = array.includes(item);

  if (!contains) {
    throw new assert.AssertionError({
      message: `Expected array to contain: ${item}`,
      actual: array,
      expected: item,
      operator: "includes",
    });
  }
};

export { shouldExistInFilesystem, shouldBeARecipe, arrayContains };
