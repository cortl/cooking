import fs from "fs";

import { buildTableSchemaSql } from "./sql-builder/tables.js";
import { buildRecipesSqlStatements } from "./sql-builder/recipes.js";

(async () => {
  if (!fs.existsSync("sql")) {
    fs.mkdirSync("sql");
  }

  const tableSchemaSql = await buildTableSchemaSql();
  const recipeSql = await buildRecipesSqlStatements();

  fs.writeFileSync("sql/0-create-tables.sql", tableSchemaSql);

  await recipeSql.map((recipe, i) =>
    fs.writeFileSync(`sql/${i + 1}.sql`, recipe),
  );

  console.log("Done!");
})();
