const {expect} = require('@jest/globals');
const fs = require('fs');

describe('Integration', () => {
    let files;

    beforeEach(() => {
        files = fs.readdirSync('lib');
    });

    test('README.md should exist', () => {
        expect('README.md').shouldExistInFilesystem();
    });

    test('scraped recipes should match schema', () => {
        files.forEach(file => {
            const recipe = JSON.parse(fs.readFileSync(`lib/${file}`));

            expect(recipe).toBeARecipe();
        })
    });
});