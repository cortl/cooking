import {google} from 'googleapis';
import {GoogleAuth} from 'google-auth-library';
import URL from 'url-parse';
import fs from 'fs';

import {getParserForSite} from './parsers';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SHEET_ID = '1KbyRcGUIBg-QxLXPuMHUaDtIZn1Uxju-zscQ-Olh3Qg';

let sitesNeeded = {};

const createRecipe = ({url, notes, rating}) => {
    const parser = getParserForSite(url)

    if (parser) {
        return parser(url, notes, rating)
            .then(recipe => {
                const location = `recipes/${recipe.slug}.json`
                if (fs.existsSync(location)) {
                    console.log(`file exists: ${location}`)
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

const createRecipeFromSheet = auth =>
    google.sheets({
        version: 'v4',
        auth
    }).spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Recipes!A2:E1000',
    }).then(res => Promise.all(res.data.values.map(row => {
        return {
            title: row[0],
            rating: parseInt(row[1], 10),
            notes: row[2],
            url: row[3],
            skip: row[4]
        }
    })
        .filter(({rating}) => Boolean(rating))
        .filter(({url}) => Boolean(url))
        .filter(({skip}) => skip !== 'TRUE')
        .map(recipe => {
            console.log(`Found ${recipe.title} in spreadsheet`)
            return recipe;
        })
        .map(createRecipe)));

const updateMarkdown = recipes => {
    const toMarkdownLink = ({title, slug}) => `    - [${title}](recipes/${slug}.json)`;
    const template = fs.readFileSync('TEMPLATE.md');
    const write = `${template}\n${recipes.map(toMarkdownLink).join('\n')}`
    fs.writeFileSync('README.md', write);
    console.log('updated table of contents');
}

const main = () => {
    const auth = new GoogleAuth({
        scopes: SCOPES
    });
    auth.getClient()
        .then(createRecipeFromSheet)
        .then(recipes => recipes.filter(Boolean))
        .then(updateMarkdown)
        .then(reportMissing)
        .catch(console.error);
}

main();