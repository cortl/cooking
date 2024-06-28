import fs from "fs";

import { buildTableSchemaSql } from "./create-tables-sql.js";
import { buildRecipesSqlStatements } from "./create-recipe-sql.js";

(async () => {
  const tableSchemaSql = await buildTableSchemaSql();
  const recipeSql = await buildRecipesSqlStatements();

  fs.writeFileSync("sql/0-create-tables.sql", tableSchemaSql);
  await recipeSql.map((recipe, i) =>
    fs.writeFileSync(`sql/${i + 1}.sql`, recipe),
  );

  console.log("Done!");
})();
