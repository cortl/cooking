import fs from 'fs';
import assert from 'assert';
import path from 'path';

const fieldIsA = (name, field, type) => {
    assert.strictEqual(typeof (field), type, `❌ ${name} isn\'t a ${type}`)
    console.log(`✅ ${name}`)
};
const fieldIsAnArray = (name, field) => {
    assert.ok(Array.isArray(field), `❌ ${name} is not an array`);
    field.forEach(isAString);
    console.log(`✅ ${name}`)
}
const isAString = (field) => assert.strictEqual(typeof (field), 'string')


const test = () => {
    console.log('Project:')
    assert.ok(fs.existsSync('README.md'), '❌ no readme file found')
    console.log('✅ README.md exists!')

    console.log('Recipes:')
    const items = fs.readdirSync('recipes');
    items.forEach(item => {
        console.log(`📑 ${item}`);
        console.group()
        try {
            const recipe = JSON.parse(fs.readFileSync(`recipes/${item}`));
            const {
                title, servings, time, rating, slug, notes,
                source, image, instructions, ingredients,
                createdDate, ...unused
            } = recipe;

            assert.ok(!Object.keys(unused).length, '❌ extra fields found in JSON');
            console.log('✅ exact number of fields')

            fieldIsA('title', title, 'string');
            fieldIsA('servings', servings, 'number');
            fieldIsA('rating', rating, 'number');
            fieldIsA('slug', slug, 'string');
            fieldIsA('source', source, 'string');

            if (createdDate) {
                assert.ok(!isNaN(new Date(createdDate).getTime()), '❌ created date is not a date')
                console.log('✅ created date');
            }

            fieldIsAnArray('instructions', instructions)
            fieldIsAnArray('notes', instructions)

            assert.ok(Array.isArray(ingredients), '❌ ingredients is not an array');
            ingredients.forEach(ingredient => {
                const {category, items, ...extra} = ingredient;

                assert.ok(!Object.keys(extra).length, '❌ extra fields underneath ingredients');
                assert.strictEqual(typeof (category), 'string', '❌ category is not a string');
                assert.ok(Array.isArray(items), '❌ items is not an array');
            })
            console.log('✅ ingredients')

            assert.ok(Array.isArray(time), '❌ time is not an array');
            time.forEach(time => {
                const {label, units, ...extra} = time;

                assert.ok(!Object.keys(extra).length, '❌ extra fields underneath time');
                assert.strictEqual(typeof label, 'string', '❌ label is not a string');
                assert.strictEqual(typeof units, 'string', '❌ units is not a string')
            });
            console.log('✅ time')

            if (image) {
                const imagePath = path.normalize(`recipes/${image}`);
                assert(fs.existsSync(imagePath), '❌ image path is not correct');
                console.log('✅ image')
            }
            console.log('Looks 👌')
        } catch (err) {
            console.error(err);
            assert.fail(`❌ failed: ${item}`)
        } finally {
            console.groupEnd()
        }
    });
}

test();