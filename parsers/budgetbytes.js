const axios = require("axios");
const cheerio = require("cheerio");
const util = require('./util');

const parse = async (source, notes, rating) => {
    const $ = await axios.get(source)
        .then(res => res.data)
        .then(data => cheerio.load(data));

    const grabIngredientsUnderneath = (groupSelect) => groupSelect('.wprm-recipe-ingredient')
        .map((_, element) => {
            const select = cheerio.load(cheerio.html($(element)));

            const name = select('.wprm-recipe-ingredient-name').text();
            const unit = select('.wprm-recipe-ingredient-unit').text();
            const amount = select('.wprm-recipe-ingredient-amount').text();
            const measurement = Boolean(unit) ? `${amount} ${unit}` : `${amount}`;

            return `${measurement} ${name}`
        }).get();

    const isGrouped = Boolean($('.wprm-recipe-group-name').length)

    const ingredients = isGrouped
        ? $('.wprm-recipe-ingredient-group').map((_, element) => {
            const groupSelect = cheerio.load(cheerio.html($(element)));

            let section = {
                category: groupSelect('.wprm-recipe-ingredient-group-name').text(),
                items: grabIngredientsUnderneath(groupSelect, element)
            }
            return section
        }).get()
        : [{
            category: 'All',
            items: grabIngredientsUnderneath($)
        }]

    const instructions = $('.wprm-recipe-instruction-text').map((_, element) => $(element).text()).get();
    const title = $('h1').text();
    const slug = util.createSlug(title);

    const imageUrl = $('#content').find('img')
        .map((_, element) => $(element).attr('data-lazy-src'))
        .get()[0];

    if (!Boolean(imageUrl)) {
        console.log(`no image for ${title} from ${source}`);
    }

    const image = imageUrl
        ? await util.downloadImage(slug, imageUrl)
        : "";


    const servings = parseInt($('.wprm-recipe-servings').text());

    const time = [
        {
            label: "Prep",
            units: `${$('.wprm-recipe-prep_time-minutes').text()} minutes`
        },
        {
            label: "Cook",
            units: `${$('.wprm-recipe-cook_time-minutes').text()} minutes`
        },
        {
            label: "Total",
            units: `${$('.wprm-recipe-total_time-minutes').text()} minutes`
        }
    ]

    return {
        title,
        servings,
        time,
        slug,
        image,
        rating,
        notes: [notes],
        source: source,
        ingredients,
        instructions,
        createdDate: new Date().toLocaleDateString()
    };
}

module.exports = {
    parse
}