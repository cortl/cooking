import * as Cheerio from 'cheerio';

import * as Util from './util';

const parse = async (source, notes, rating) => {
    const page = await Util.getPage(source);
    const $ = Cheerio.load(page);


    const items = $('.ingredient').map((_, element) => $(element).text().trim()).get()
    const instructions = $('.structured-project__steps').find('ol').find('li')
        .map((_, element) => $(element).text()).get()
        .map(instruction => instruction.replace(/\n/gi, ''))
        .map(instruction => instruction.replace(/\s{2,}/gi, ''));
    const title = $('.heading__title').text();
    const slug = Util.createSlug(title);

    const imageUrl = $('.primary-image').attr('src');
    const image = imageUrl
        ? await Util.downloadImage(slug, imageUrl)
        : "";
    const servings = $('.project-meta__results-container').text().split(' ')
        .map(word => parseInt(word))
        .find(Number.isInteger)

    const time = $('.project-meta__times-container').find('.loc').map((i, element) => {
        const label = $(element).find('.meta-text__label').text().trim().replace(':', '');
        const units = $(element).find('.meta-text__data').text().trim();
        return {
            label,
            units
        }
    }).get();

    return {
        title,
        servings,
        time,
        slug: Util.createSlug(title),
        image,
        rating,
        notes: [notes],
        source: source,
        ingredients: [
            {
                category: 'All',
                items
            }
        ],
        instructions,
        createdDate: new Date().toLocaleDateString()
    };
}

export {
    parse
}