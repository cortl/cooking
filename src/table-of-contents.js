import fs from 'fs';

const updateMarkdown = recipes => {
    const toMarkdownLink = ({title, slug}) => `\t- [${title}](recipes/${slug}.json)`;
    const template = fs.readFileSync('TEMPLATE.md');
    const write = `${template}\n${recipes.map(toMarkdownLink).join('\n')}`

    fs.writeFileSync('README.md', write);

    console.log('updated table of contents');
}

export {updateMarkdown}