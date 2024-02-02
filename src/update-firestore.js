import { Firestore } from "@google-cloud/firestore";
import fs from "fs";

(async () => {
  const firestore = new Firestore();

  const files = fs.readdirSync("lib");
  console.log("Reading...");
  const recipes = files
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(`lib/${file}`)));

  recipes.forEach(async (recipe) => {
    try {
      if (!recipe.slug) {
        console.log(`Skipping ${recipe.title} as there is no slug set`);
        return;
      }

      const docRef = firestore.collection("recipes").doc(recipe.slug);
      await docRef.set(recipe);
    } catch (err) {
      console.error(err);
    }
  });
})();
