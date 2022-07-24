const Joi = require("./joi");

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

const schema = Joi.object({
  title: Joi.title().required(),
  servings: Joi.number().required(),
  rating: Joi.number().integer().strict().required(),
  slug: Joi.string().required(),
  source: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().required(),
  }).required(),
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
    .unique()
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
  related: Joi.array().items(Joi.slug()),
});

module.exports = {
  schema,
};
