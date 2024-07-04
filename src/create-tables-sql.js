import knex from "knex";

const buildTableSchemaSql = async () => {
  const pg = knex({
    client: "pg",
  });

  const statements = await Promise.all([
    await pg.raw("CREATE EXTENSION IF NOT EXISTS pg_trgm;").toString(),
    await pg.schema
      .createTable("images", (table) => {
        table.string("slug").primary();
        table.integer("height");
        table.integer("width");
        table.binary("data");
      })
      .toString(),
    await pg.schema
      .createTable("recipes", (table) => {
        table.string("slug").primary();
        table.string("title").notNullable();
        table.boolean("archived").defaultTo(false);
        table.date("created_date");
        table
          .string("image")
          .references("slug")
          .inTable("images")
          .onDelete("SET NULL");
        table.integer("rating").checkBetween([0, 10]);
        table.integer("servings");
        table.string("source_name");
        table.string("source_url");
        table.jsonb("time");
        table.specificType("tags", "TEXT[]");
      })
      .toString(),

    await pg.schema
      .createTable("ingredients", (table) => {
        table.increments("id").primary();
        table
          .string("recipe_slug")
          .notNullable()
          .references("slug")
          .inTable("recipes")
          .onDelete("CASCADE");
        table.string("category");
        table.specificType("items", "text[]");
      })
      .toString(),

    await pg.schema
      .createTable("instructions", (table) => {
        table.increments("id").primary();
        table
          .string("recipe_slug")
          .notNullable()
          .references("slug")
          .inTable("recipes")
          .onDelete("CASCADE");
        table.integer("step_order");
        table.text("instruction");
      })
      .toString(),

    await pg.schema
      .createTable("notes", (table) => {
        table.increments("id").primary();
        table
          .string("recipe_slug")
          .notNullable()
          .references("slug")
          .inTable("recipes")
          .onDelete("CASCADE");
        table.text("note");
      })
      .toString(),

    await pg.schema
      .createTable("related_recipes", (table) => {
        table.increments("id").primary();
        table
          .string("recipe_slug")
          .notNullable()
          .references("slug")
          .inTable("recipes")
          .onDelete("CASCADE");
        table.string("related_recipe_slug");
      })
      .toString(),
  ]);

  await pg.destroy();

  return statements
    .map((statement) => {
      if (statement.endsWith(";")) {
        return statement;
      } else {
        return statement + ";";
      }
    })
    .join("\n\n");
};

export { buildTableSchemaSql };
