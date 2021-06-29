import Axios from 'axios';
import fs from 'fs';

const createSlug = title => title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s/g, '-');
const downloadImage = async (slug, url) => {
    const split = url.split('.');
    const imageName = `${slug}.${split[split.length - 1]}`;

    const imageAlreadyExists = fs.existsSync(`images/${imageName}`);

    if (imageAlreadyExists) {
        return `../images/${imageName}`;
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