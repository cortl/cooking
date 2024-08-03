import fs from "fs";
import sharp from "sharp";
import { Recipe } from "../models/recipe";

type RecipeProcessors = {
  [Key in keyof Recipe]?: (recipe: Recipe) => Promise<any> | any;
};

const recipeProcessors: RecipeProcessors = {
  image: async (recipe: Recipe) => {
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

type ProcessedRecipe = Recipe & {
  image?: {
    path: string;
    height: number;
    width: number;
  };
};

const processRecipe = async (recipe: Recipe): Promise<ProcessedRecipe> => {
  const processedRecipe = { ...recipe };

  await Promise.all(
    Object.keys(recipe).map(async (key) => {
      if (key in recipeProcessors) {
        const processor = recipeProcessors[key as keyof Recipe];

        if (processor) {
          const result = await processor(recipe);

          if (result) {
            (processedRecipe as any)[key] = result;
          }
        }
      }
    }),
  );

  return processedRecipe as ProcessedRecipe;
};

export type { ProcessedRecipe };

export { processRecipe };
