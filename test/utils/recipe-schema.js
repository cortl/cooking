const Joi = require("./joi");
const { TIME_MEASUREMENTS, TIME_LABELS, TAGS } = require("../../src/constants");

const schema = Joi.object({
  title: Joi.title().required(),
  servings: Joi.number().required(),
  rating: Joi.number().integer().strict().required(),
  slug: Joi.slug().required(),
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
  image: Joi.image(),
  related: Joi.array().items(Joi.slug()),
});

module.exports = {
  schema,
};
