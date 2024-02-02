const joi = require("joi");
const fs = require("fs");

const FORBIDDEN_TITLE_WORDS = ["bravetart", "best", "recipe", "delicious"].map(
  (word) => word.toUpperCase(),
);

const Joi = joi
  .extend({
    type: "file",
    validate: (value) => {
      if (value === "") {
        return { value, errors: [new Error(`image field was empty`)] };
      }
      const exists = fs.existsSync(`images/${value}`);

      return exists
        ? { value, errors: [] }
        : {
            value,
            errors: [new Error(`${value} does note exist`)],
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
              `Recipe contains forbidden word(s): ${matches.join(", ")}`,
            ),
          ],
        };
      }

      return { value, errors: [] };
    },
  })
  .extend({
    type: "slug",
    validate: (value) => {
      if (value === "") {
        return { value, errors: [new Error(`slug was empty`)] };
      }

      const exists = fs.existsSync(`lib/${value}.json`);

      return exists
        ? { value, errors: [] }
        : {
            value,
            errors: [new Error(`${value} does not exist.`)],
          };
    },
  });

module.exports = Joi;
