const byRecipeHasRating = ({ rating }) => Boolean(rating);
const byRecipeHasURL = ({ url }) => Boolean(url);
const byRecipeShouldBeSkipped = ({ skip }) => skip !== "TRUE";

export { byRecipeHasRating, byRecipeHasURL, byRecipeShouldBeSkipped };
