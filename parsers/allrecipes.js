import Cheerio from 'cheerio';

import * as Util from './util';

const getMetaInfo = ($, header) => $('.recipe-info-section').find('.recipe-meta-item')
    .map((_, element) => {
        const select = Cheerio.load(Cheerio.html($(element)));
        const header = select('.recipe-meta-item-header').text().trim();
        const body = select('.recipe-meta-item-body').text().trim();
        return {
            header,
            body
        }
    }).get()
    .find(section => section.header.toLowerCase().includes(header.toLowerCase()))

const parse = async (source, notes, rating) => {
    const page = await Util.getPage(source);
    const $ = Cheerio.load(page);

    const ingredients = $('span.ingredients-item-name')
        .map((_, element) => $(element).text()).get()
        .map(ingredient => ingredient.trim())

    const instructions = $('li.instructions-section-item')
        .map((_, element) => {
            const select = Cheerio.load(Cheerio.html($(element)))
            return select('.paragraph').text();
        }).get()
        .map(instruction => instruction.trim())

    const title = $('h1.headline').text();
    const servings = getMetaInfo($, 'Servings:').body;

    const time = $('.two-subcol-content-wrapper').first()
        .find('.recipe-meta-item').map((_, element) => {
            const select = Cheerio.load(Cheerio.html($(element)));
            const label = select('.recipe-meta-item-header').text().trim().replace(':', '');
            const units = select('.recipe-meta-item-body').text().trim();
            return {
                label,
                units
            }
        }).get();

    return {
        title,
        servings: parseInt(servings),
        time,
        slug: Util.createSlug(title),
        rating,
        notes: [notes],
        source: source,
        ingredients: [{
            category: 'All',
            items: ingredients
        }],
        instructions
    };
}

export {
    parse
}