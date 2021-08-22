import fs from 'fs';
import path from 'path';

let existingSites = {};

fs.readdirSync(path.normalize('lib')).forEach(item => {
    console.log(item);
    const filePath = path.normalize(`lib/${item}`);

    console.log(filePath);
    const recipe = JSON.parse(fs.readFileSync(filePath));

    existingSites[recipe.source] = {
        title: recipe.title,
        slug: recipe.slug
    };
});

const getExistingRecipe = (url) => existingSites.hasOwnProperty(url)
    ? existingSites[url]
    : null;

export {
    getExistingRecipe
}