import type { ApiError, SearchLink, SnapChefResult } from "./snapchef-types";

export function buildClientSearchLinks(dishName: string): SearchLink[] {
  return [
    {
      label: `${dishName} recipe tutorial`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${dishName} recipe tutorial`)}`,
    },
    {
      label: `${dishName} beginner recipe`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${dishName} beginner recipe`)}`,
    },
  ];
}

export function formatShoppingList(result: SnapChefResult) {
  return [
    `${result.dishName} shopping list`,
    "",
    ...result.shoppingPlan.items.map((item) => {
      const amount = item.amount ? ` - ${item.amount}` : "";
      const price = item.estimatedPrice ? ` (${item.estimatedPrice})` : "";
      const location = item.whereToFind ? ` - ${item.whereToFind}` : "";
      return `- ${item.name}${amount}${price}${location}`;
    }),
    "",
    result.shoppingPlan.priceNote,
  ].join("\n");
}

export function formatRecipeForExport(result: SnapChefResult) {
  return [
    result.dishName,
    result.summary,
    "",
    `${result.recipe.title} | ${result.recipe.time} | ${result.recipe.difficulty} | ${result.recipe.servings}`,
    "",
    "Ingredients",
    ...result.ingredients.map((ingredient) => {
      const amount = ingredient.amount ? ` - ${ingredient.amount}` : "";
      const note = ingredient.note ? ` (${ingredient.note})` : "";
      return `- ${ingredient.name}${amount}${note}`;
    }),
    "",
    "Steps",
    ...result.recipe.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "Shopping",
    formatShoppingList(result),
    "",
    "Nutrition estimate",
    `${result.nutritionEstimate.calories}, ${result.nutritionEstimate.protein}, ${result.nutritionEstimate.carbs}, ${result.nutritionEstimate.fat}`,
    result.nutritionEstimate.note,
    "",
    "Allergy check",
    "SnapChef may not detect hidden ingredients. Always check labels and ask about allergens.",
  ].join("\n");
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "recipe"
  );
}

export function ensureClientResult(result: SnapChefResult): SnapChefResult {
  const dishName = result.dishName || "Saved recipe";

  return {
    ...result,
    nutritionEstimate: result.nutritionEstimate ?? {
      calories: "estimate varies",
      protein: "protein varies",
      carbs: "carbs vary",
      fat: "fat varies",
      note: "Estimated per serving. Actual nutrition changes with portions, brands, cooking oil, sauces, and substitutions.",
    },
    recipeVariants: result.recipeVariants?.length
      ? result.recipeVariants
      : [
          {
            title: "High-protein version",
            description: `Add a lean protein to make ${dishName} more filling.`,
            adjustment: "Use chicken, tofu, beans, eggs, or Greek-yogurt-based sauces when they fit the dish.",
          },
          {
            title: "Cheaper version",
            description: "Use store-brand staples and skip optional specialty toppings.",
            adjustment: "Lean on pantry seasonings, frozen vegetables, and ingredients you already have.",
          },
          {
            title: "Spicy version",
            description: "Add heat without changing the whole recipe.",
            adjustment: "Use chili flakes, hot sauce, chili oil, or jalapeno a little at a time.",
          },
        ],
  };
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
}
