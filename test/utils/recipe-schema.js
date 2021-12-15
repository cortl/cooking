const joi = require('joi');
const path = require('path');
const fs = require('fs');

const Joi = joi.extend(
    {
        type: 'file',
        validate: (value) => {
            if (value === "") {
                return {value, errors: [new Error(`image field was empty`)]}
            }
            const imagePath = path.normalize(`lib/${value}`);
            const exists = fs.existsSync(imagePath)

            return exists
                ? {value, errors: []}
                : {
                    value,
                    errors: [new Error(`${imagePath} does note exist`)]
                }
        }
    }
)

const schema = Joi.object({
    title: Joi.string(),
    servings: Joi.number(),
    rating: Joi.number(),
    slug: Joi.string(),
    source: Joi.string(),
    createdDate: Joi.date(),
    instructions: Joi.array().items(Joi.string()),
    notes: Joi.array().items(Joi.string().allow('')),
    ingredients: Joi.array().items({
        category: Joi.string().allow(''),
        items: Joi.array().items(Joi.string())
    }),
    time: Joi.array().items({
        label: Joi.string().valid('Prep', 'Cook', 'Active', 'Total'),
        units: Joi.array().items({
            measurement: Joi.number().greater(0),
            label: Joi.string().valid('day', 'days', 'hour', 'hours', 'minute', 'minutes')
        })
    }),
    image: Joi.file()
})

module.exports = {
    schema
}