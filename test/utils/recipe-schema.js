const joi = require("joi");
const path = require("path");
const fs = require("fs");

const TIME_LABELS = [
  "Prep",
  "Cook",
  "Proof",
  "Bulk Ferment",
  "Caramelize",
  "Broil",
  "Marinate",
  "Active",
  "Total",
  "Inactive",
];

const TIME_MEASUREMENTS = ["day", "days", "hour", "hours", "minute", "minutes"];

const TAGS = [
  "Vegan",
  "Vegetarian",
  "Poultry",
  "Fish",
  "Beef",
  "Pork",
  "Drink",
  "Soup",
  "Appetizer",
  "Quick",
  "Salad",
  "Sandwich",
  "Pasta",
  "Dinner",
  "Dessert",
  "Breakfast",
  "Meal Prep",
  "Topping",
  "Thanksgiving",
  "Christmas",
  "Super Bowl",
  "Baking",
  "Roasting",
  "Frying",
  "Slow Cooker",
  "Braising & Stewing",
  "No Cook",
  "Stovetop",
  "Fermenting",
  "Pressure Cooker",
  "Seasoning Blend",
  "Grilling"
];

const Joi = joi.extend({
  type: "file",
  validate: (value) => {
    if (value === "") {
      return {value, errors: [new Error(`image field was empty`)]};
    }
    const imagePath = path.normalize(`lib/${value}`);
    const exists = fs.existsSync(imagePath);

    return exists
      ? {value, errors: []}
      : {
        value,
        errors: [new Error(`${imagePath} does note exist`)],
      };
  },
});

const schema = Joi.object({
  title: Joi.string(),
  servings: Joi.number(),
  rating: Joi.number(),
  slug: Joi.string(),
  source: Joi.string(),
  createdDate: Joi.date(),
  instructions: Joi.array().items(Joi.string()),
  notes: Joi.array().items(Joi.string().allow("")),
  ingredients: Joi.array().items({
    category: Joi.string().allow(""),
    items: Joi.array().items(Joi.string()),
  }),
  tags: Joi.array()
    .items(Joi.string().valid(...TAGS))
    .required(),
  time: Joi.array()
    .items({
      label: Joi.string()
        .valid(...TIME_LABELS)
        .required(),
      units: Joi.array()
        .items({
          measurement: Joi.number().greater(0).required(),
          label: Joi.string()
            .valid(...TIME_MEASUREMENTS)
            .required(),
        })
        .required(),
    })
    .required(),
  image: Joi.file(),
});

module.exports = {
  schema,
};
