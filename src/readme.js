import fs from "fs";

const insertLink = (name, url) => `- [${name}](${url})`

const buildTemplate = (recipes) =>
`# Recipes

## Table of Contents
${recipes.map((recipe) => insertLink(recipe.title, `lib/${recipe.slug}.json`)).join('\n')}
`;

(() => {
    const files = fs.readdirSync("lib");
    console.log("Reading...");
    const recipes = files.map((file) =>
    ({
        ...JSON.parse(fs.readFileSync(`lib/${file}`)),
        file
    })
    );

    const toWrite = buildTemplate(recipes);

    fs.writeFileSync('README.md', toWrite);
})()