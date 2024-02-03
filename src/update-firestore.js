import { Firestore, FieldValue } from "@google-cloud/firestore";
import fs from "fs";

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
]

const mapToFirestore = (recipe) => {
  return {
    ...recipe,
    searchableTitle: recipe.title.toLowerCase(),
    tags: TAGS.reduce((acc, tag) => {
      acc[tag] = recipe.tags.includes(tag);

      return acc;
    }, {}),
  }

}

(async () => {
  const firestore = new Firestore();

  const files = fs.readdirSync("lib");
  console.log("Reading...");
  const recipes = files
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(`lib/${file}`)));

  console.group('Uploading Tags')
  TAGS.forEach((tag) => {
    console.log(`Uploading ${tag}...`);

    firestore.collection("tags").doc(tag).set({ name: tag, recipes: [] });
  })
  console.groupEnd();
  console.log('Done!')

  console.group('Uploading Base Recipes')
  recipes.forEach(async (recipe) => {
    try {
      if (!recipe.slug) {
        console.log(`Skipping ${recipe.title} as there is no slug set`);
        return;
      }

      const docRef = firestore.collection("recipes").doc(recipe.slug);

      const data = mapToFirestore(recipe);

      // Go through tags, and add the recipe to the tag collection if it has the tag
      Object.keys(data.tags).forEach((tag) => {
        if (data.tags[tag]) {
          firestore.collection("tags").doc(tag).update({
            recipes: FieldValue.arrayUnion(recipe.slug),
          });
        }
      });

      console.log(`Uploading ${recipe.title}...`);
      await docRef.set(data);
    } catch (err) {
      console.error(err);
    }
  });
  console.groupEnd();
  console.log('Done!')
})();
