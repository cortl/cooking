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
  "Grilling",
];

const FORBIDDEN_TITLE_WORDS = ["bravetart", "best", "recipe", "delicious"].map(
  (word) => word.toUpperCase()
);

const Joi = joi
  .extend({
    type: "file",
    validate: (value) => {
      if (value === "") {
        return { value, errors: [new Error(`image field was empty`)] };
      }
      const imagePath = path.normalize(`lib/${value}`);
      const exists = fs.existsSync(imagePath);

      return exists
        ? { value, errors: [] }
        : {
            value,
            errors: [new Error(`${imagePath} does note exist`)],
          };
    },
  })
  .extend({
    type: "title",
    validate: (value) => {
      if (typeof value !== "string") {
        return {
          value,
          errors: [new Error("Recipe title must be a string")],
        };
      }

      const matches = value
        .split(" ")
        .filter((word) => FORBIDDEN_TITLE_WORDS.includes(word.toUpperCase()));
      if (matches.length) {
        return {
          value,
          errors: [
            new Error(
              `Recipe contains forbidden word(s): ${matches.join(", ")}`
            ),
          ],
        };
      }

      return { value, errors: [] };
    },
  });

const schema = Joi.object({
  title: Joi.title().required(),
  servings: Joi.number().required(),
  rating: Joi.number().required(),
  slug: Joi.string().required(),
  source: Joi.string().required(),
  createdDate: Joi.date().optional(),
  instructions: Joi.array().items(Joi.string()).min(1).required(),
  notes: Joi.array().items(Joi.string()).required(),
  archived: Joi.boolean().optional(),
  ingredients: Joi.array()
    .items({
      category: Joi.string().allow(""),
      items: Joi.array().items(Joi.string()),
    })
    .required(),
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
    .min(1)
    .required(),
  image: Joi.file(),
});

module.exports = {
  schema,
};
