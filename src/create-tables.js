import knex from 'knex';
import { TAGS } from './constants.js';

const pg = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: 5432,
        user: 'recipes',
        database: 'recipes',
        password: 'recipes'
    },
});

(async () => {
    // Clear existing tables
    await pg.raw('DROP TABLE IF EXISTS images CASCADE');
    await pg.raw('DROP TABLE IF EXISTS recipes CASCADE');
    await pg.raw('DROP TABLE IF EXISTS ingredients CASCADE');
    await pg.raw('DROP TABLE IF EXISTS instructions CASCADE');
    await pg.raw('DROP TABLE IF EXISTS notes CASCADE');
    await pg.raw('DROP TABLE IF EXISTS tags CASCADE');
    await pg.raw('DROP TYPE IF EXISTS tag_enum CASCADE');
    await pg.raw('DROP TABLE IF EXISTS related_recipes CASCADE');

    await pg.schema.createTable('images', (table) => {
        table.string('slug').primary();
        table.integer('height');
        table.integer('width');
        table.binary('data');
    })

    await pg.schema.createTable('recipes', (table) => {
        table.string('slug').primary();
        table.string('title').notNullable();
        table.boolean('archived').defaultTo(false);
        table.date('created_date').notNullable();
        table.string('image').references('slug').inTable('images').onDelete('SET NULL');
        table.integer('rating').checkBetween([0, 10]);
        table.integer('servings');
        table.string('source_name');
        table.string('source_url');
        table.jsonb('time');
    });

    await pg.schema.createTable('ingredients', (table) => {
        table.increments('id').primary();
        table.string('recipe_slug').notNullable().references('slug').inTable('recipes').onDelete('CASCADE');
        table.string('category');
        table.specificType('items', 'text[]');
    });

    await pg.schema.createTable('instructions', (table) => {
        table.increments('id').primary();
        table.string('recipe_slug').notNullable().references('slug').inTable('recipes').onDelete('CASCADE');
        table.integer('step_order');
        table.text('instruction');
    });

    await pg.schema.createTable('notes', (table) => {
        table.increments('id').primary();
        table.string('recipe_slug').notNullable().references('slug').inTable('recipes').onDelete('CASCADE');
        table.text('note');
    });

    // TODO
    await pg.raw(`CREATE TYPE "tag_enum" AS ENUM (${TAGS.map(tag => `'${tag}'`).join(', ')});`)
    // await pg.schema.createType('tag_enum', TAGS);

    await pg.schema.createTable('tags', (table) => {
        table.string('recipe_slug').notNullable().references('slug').inTable('recipes').onDelete('CASCADE');
        table.enum('tag', TAGS);
        table.primary(['recipe_slug', 'tag']);
    });

    await pg.schema.createTable('related_recipes', (table) => {
        table.increments('id').primary();
        table.string('recipe_slug').notNullable().references('slug').inTable('recipes').onDelete('CASCADE');
        table.string('related_recipe_slug');
    });

    pg.destroy();
})();