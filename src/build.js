import fs from "fs";

(() => {
  const files = fs.readdirSync("lib");
  console.log("Reading...");
  const recipes = files.map((file) =>
    JSON.parse(fs.readFileSync(`lib/${file}`)),
  );

  console.log("Building bundle...");
  fs.writeFileSync("index.json", JSON.stringify(recipes));

  console.log("Built!");
})();
