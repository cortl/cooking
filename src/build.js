import fs from 'fs';
import path from 'path';

const build = () => {
    const files = fs.readdirSync('lib');
    const requires = files.map(file => {
        const filePath = path.normalize(`lib/${file}`);
        const {slug} = JSON.parse(fs.readFileSync(filePath));

        return `\t'${slug}': require('./${filePath}')`
    })

    fs.writeFileSync('index.js', `import {createRequire} from 'module';\nconst require = createRequire(import.meta.url);\n\nexport default {\n${requires.join(',\n')}\n}`)
}

build();