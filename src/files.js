import fs from 'fs';
import path from 'path';

let existingSites = {};

fs.readdirSync(path.normalize('recipes')).forEach(item => {
    console.log(item);
    const filePath = path.normalize(`recipes/${item}`);

    console.log(filePath);
    const recipe = JSON.parse(fs.readFileSync(filePath));

    existingSites[recipe.source] = recipe.title
});

const getExistingRecipe = (url) => existingSites.hasOwnProperty(url)
    ? existingSites[url]
    : null;

export {
    getExistingRecipe
}