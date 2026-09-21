export type Confidence = "high" | "medium" | "low";

export type Ingredient = {
  name: string;
  amount?: string;
  note?: string;
};

export type ShoppingItem = {
  name: string;
  amount?: string;
  estimatedPrice?: string;
  whereToFind?: string;
  note?: string;
};

export type ShoppingPlan = {
  estimatedTotal: string;
  estimatedPerServing: string;
  priceNote: string;
  items: ShoppingItem[];
  savingTips: string[];
};

export type Recipe = {
  title: string;
  time: string;
  difficulty: string;
  servings: string;
  steps: string[];
};

export type SearchLink = {
  label: string;
  url: string;
};

export type NutritionEstimate = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  note: string;
};

export type RecipeVariant = {
  title: string;
  description: string;
  adjustment: string;
};

export type SnapChefResult = {
  dishName: string;
  confidence: Confidence;
  summary: string;
  ingredients: Ingredient[];
  recipe: Recipe;
  substitutions: string[];
  nutritionNotes: string[];
  safetyNotes: string[];
  searchLinks: SearchLink[];
  shoppingPlan: ShoppingPlan;
  nutritionEstimate: NutritionEstimate;
  recipeVariants: RecipeVariant[];
  appliedPreferences: string[];
  exampleMode?: boolean;
  notice?: string;
};

export type SavedScan = {
  id: string;
  dish_name: string;
  confidence: Confidence;
  summary: string;
  result: SnapChefResult;
  image_path: string | null;
  created_at: string;
};

export type ApiError = {
  error: string;
};

export type ResultTab = "recipe" | "ingredients" | "shopping" | "nutrition" | "ideas" | "videos";
export type MainView = "scan" | "history";
