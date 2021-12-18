const fs = require("fs");

const { schema } = require("./utils/recipe-schema");

expect.extend({
  shouldExistInFilesystem(recieved, validator) {
    const result = fs.existsSync(recieved);

    return result
      ? { pass: true, message: () => `${recieved} exists` }
      : { pass: false, message: () => `${recieved} does not exist` };
  },
  toBeARecipe(recieved, _validator) {
    const { title } = recieved;

    const { _value, error } = schema.validate(recieved);

    if (error) {
      return {
        pass: false,
        message: () => `${title}: ${error.message}`,
      };
    }

    return { pass: true, message: () => `${title} 👌` };
  },
});
