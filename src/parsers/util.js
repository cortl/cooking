import Axios from 'axios';
import fs from 'fs';

import {getExistingRecipe} from '../files';

const createSlug = title => title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s/g, '-');

const downloadImage = async (slug, source, url) => {
    const existingRecipe = getExistingRecipe(source);
    const split = url.split('.');
    const imageName = `${slug}.${split[split.length - 1]}`;

    if (existingRecipe?.image) {
        return existingRecipe.image;
    }

    await Axios({
        method: "get",
        url,
        responseType: "stream"
    }).then((response) => {
        response.data.pipe(fs.createWriteStream(`images/${imageName}`));
    });
    return `../images/${imageName}`
};

const getPage = async (url) => Axios.get(url).then(res => res.data);

export {
    createSlug,
    downloadImage,
    getPage
}