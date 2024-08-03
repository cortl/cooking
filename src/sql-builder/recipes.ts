import fs from "fs";
import knex from "knex";

import { ProcessedRecipe, processRecipe } from "./processors";

const DELIMITER = "\n\n";

const addDelimiterIfNecessary = (sql: string) => {
  return sql.endsWith(";") ? sql : `${sql};`;
};

/**
 * Create's a SQL string of the queries made to insert a recipe into the database.
 *
 * @param {any} recipe
 * @returns {Promise<string>}
 */
const createRecipeSql = async (recipe: ProcessedRecipe) => {
  const pg = knex({
    client: "pg",
  });

  const statements = (
    await Promise.all([
      (async () => {
        if (!recipe.image) return null;

        const { path, height, width } = recipe.image;

        const imageData = fs.readFileSync(`images/${path}`);
        const imageHex = "\\x" + imageData.toString("hex");

        return addDelimiterIfNecessary(
          await pg("images")
            .insert({
              slug: path,
              height,
              width,
              data: imageHex,
            })
            .toString(),
        );
      })(),
      addDelimiterIfNecessary(
        await pg("recipes")
          .insert({
            slug: recipe.slug,
            title: recipe.title,
            archived: recipe.archived,
            created_date: recipe.createdDate,
            image: recipe.image?.path ?? null,
            rating: recipe.rating,
            servings: recipe.servings,
            source_name: recipe.source.name,
            source_url: recipe.source.url,
            time: JSON.stringify(recipe.time),
            tags: recipe.tags,
          })
          .toString(),
      ),
      (
        await Promise.all(
          recipe.ingredients.map(async (ingredient) => {
            return addDelimiterIfNecessary(
              await pg("ingredients")
                .insert({
                  recipe_slug: recipe.slug,
                  category: ingredient.category,
                  items: ingredient.items,
                })
                .toString(),
            );
          }),
        )
      ).join(DELIMITER),
      (
        await Promise.all(
          recipe.instructions.map(async (instruction, idx) => {
            return addDelimiterIfNecessary(
              await pg("instructions")
                .insert({
                  recipe_slug: recipe.slug,
                  step_order: idx + 1,
                  instruction: instruction,
                })
                .toString(),
            );
          }),
        )
      ).join(DELIMITER),
      (
        await Promise.all(
          recipe.notes.map(async (note) => {
            return addDelimiterIfNecessary(
              await pg("notes")
                .insert({
                  recipe_slug: recipe.slug,
                  note: note,
                })
                .toString(),
            );
          }),
        )
      ).join(DELIMITER),
      (async () => {
        if (!recipe.related) return;

        return (
          await Promise.all(
            recipe.related.map(async (related) => {
              return addDelimiterIfNecessary(
                await pg("related_recipes")
                  .insert({
                    recipe_slug: recipe.slug,
                    related_recipe_slug: related,
                  })
                  .toString(),
              );
            }),
          )
        ).join(DELIMITER);
      })(),
    ])
  )
    .filter(Boolean)
    .join(DELIMITER);

  await pg.destroy();

  return statements;
};

const buildRecipesSqlStatements = async () => {
  const files = fs.readdirSync("lib");

  console.log("Processing recipes...");
  const recipes = await Promise.all(
    files.map(async (file) => {
      const recipe = JSON.parse(fs.readFileSync(`lib/${file}`, "utf-8"));

      return processRecipe(recipe);
    }),
  );

  console.log("Creating recipe sql...");
  const recipeSqls = await Promise.all(recipes.map(createRecipeSql));

  return recipeSqls;
};

export { buildRecipesSqlStatements };
