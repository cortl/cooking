import URL from 'url-parse';
import fs from 'fs';

import {getParserForSite} from './parsers';
import {getSpreadsheet} from './src/spreadsheet';
import {mapDataToRecipeType, mapWithLog} from './src/mapper';
import {byRecipeHasRating, byRecipeHasURL, byRecipeShouldBeSkipped} from './src/filters';

let sitesNeeded = {};
let existingSites = {};

fs.readdirSync('recipes').forEach(item => {
    const recipe = JSON.parse(fs.readFileSync(`recipes/${item}`));

    existingSites[recipe.source] = recipe.title
});

const doesRecipeExist = (url) => existingSites.hasOwnProperty(url);

const createRecipe = ({url, notes, rating}) => {
    const parser = getParserForSite(url)

    if (parser) {
        return parser(url, notes, rating)
            .then(recipe => {
                const location = `recipes/${recipe.slug}.json`

                if (doesRecipeExist(url)) {
                    console.log(`Old recipe exists under ${existingSites[url]}`)
                    const oldRecipe = JSON.parse(fs.readFileSync(location));
                    recipe = {
                        ...oldRecipe,
                        rating,
                        notes: [notes]
                    };
                } else {
                    console.log(`recipe cached: ${location}`);
                }

                fs.writeFileSync(location, JSON.stringify(recipe, null, 2));

                return recipe;
            })
            .catch(e => {
                console.error(url, e)
            });
    } else {
        const site = URL(url).hostname;
        sitesNeeded[site] = (sitesNeeded[site] || 0) + 1;
        console.log(`Parser does not exist for ${site}`);
    };
}

const reportMissing = () => {
    Object.keys(sitesNeeded).forEach(site => {
        console.log(`Missing ${sitesNeeded[site]} total for ${site}`);
    });
}

const createRecipeFromSheet = data => {
    return Promise.all(data.map(mapDataToRecipeType)
        .filter(byRecipeHasRating)
        .filter(byRecipeHasURL)
        .filter(byRecipeShouldBeSkipped)
        .map(mapWithLog(({title}) => `Found ${title} in spreadsheet`))
        .map(createRecipe));
}

const updateMarkdown = recipes => {
    const toMarkdownLink = ({title, slug}) => `    - [${title}](recipes/${slug}.json)`;
    const template = fs.readFileSync('TEMPLATE.md');
    const write = `${template}\n${recipes.map(toMarkdownLink).join('\n')}`
    fs.writeFileSync('README.md', write);
    console.log('updated table of contents');
}

const main = async () => {
    const data = await getSpreadsheet();

    createRecipeFromSheet(data)
        .then(recipes => recipes.filter(Boolean))
        .then(updateMarkdown)
        .then(reportMissing)
        .catch(console.error);
}

main();