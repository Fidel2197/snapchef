import type { Confidence, SnapChefResult } from "./snapchef-types";

export const preferencePresets = [
  { label: "College budget", value: "college budget, cheap ingredients, price estimates" },
  { label: "High protein", value: "high protein, filling, meal prep friendly" },
  { label: "Vegetarian", value: "vegetarian, no meat, beginner friendly" },
  { label: "Spicy", value: "spicy, bold flavor, easy swaps" },
  { label: "15-minute", value: "15 minute meal, minimal prep, quick cleanup" },
  { label: "Dairy-free", value: "dairy free, avoid milk cheese butter cream" },
  { label: "No peanuts", value: "no peanuts, peanut allergy aware" },
  { label: "Meal prep", value: "meal prep friendly, leftovers, reheats well" },
  { label: "Microwave", value: "microwave only, dorm friendly, no stove" },
  { label: "Air fryer", value: "air fryer, minimal oil, crispy finish" },
  { label: "No oven", value: "no oven, stovetop or microwave method" },
  { label: "One pot", value: "one pot, easy cleanup, minimal equipment" },
  { label: "Dorm kitchen", value: "dorm kitchen, budget tools, limited equipment" },
];

export const confidenceGuide = [
  {
    level: "high",
    label: "High",
    detail: "The dish is visually clear, so the match is likely reliable.",
  },
  {
    level: "medium",
    label: "Medium",
    detail: "The dish looks familiar, but some ingredients may be guessed.",
  },
  {
    level: "low",
    label: "Low",
    detail: "The photo is unclear or the dish is ambiguous, so double-check the result.",
  },
] satisfies { level: Confidence; label: string; detail: string }[];

export const previewTiles = [
  { label: "Dish", value: "Likely match" },
  { label: "Ingredients", value: "Pantry list" },
  { label: "Budget", value: "Price ranges" },
  { label: "Shopping", value: "Where to find it" },
  { label: "Steps", value: "Cookable plan" },
  { label: "Videos", value: "Search links" },
];

export const storyCards = [
  {
    title: "Scan the plate",
    detail: "Start from a quick food photo, screenshot, or leftovers pic.",
    image: "/snapchef-scan-pasta.png",
  },
  {
    title: "Spot ingredients",
    detail: "Turn what is visible into a useful shopping and pantry list.",
    image: "/snapchef-ingredients-prep.png",
  },
  {
    title: "Cook the plan",
    detail: "Get steps, swaps, serving changes, and video searches.",
    image: "/snapchef-cooking-plan.png",
  },
];

export const prepGuideCards = [
  {
    label: "Best photos",
    value: "Use bright lighting and keep the whole plate visible.",
  },
  {
    label: "Budget results",
    value: "Pick College budget to get price ranges and cheaper swaps.",
  },
  {
    label: "Allergy notes",
    value: "Add foods to avoid in Extra notes before analyzing.",
  },
  {
    label: "Servings",
    value: "Change servings first so ingredient amounts and cost estimates scale.",
  },
  {
    label: "Equipment",
    value: "Mention air fryer, microwave, dorm kitchen, or no oven if it matters.",
  },
  {
    label: "Good examples",
    value: "Try pasta, wraps, rice bowls, salads, tacos, soups, or leftovers.",
  },
];

export const scanGuideCards = [
  {
    label: "Reading image",
    value: "SnapChef checks the dish, visible toppings, sauces, and serving size.",
  },
  {
    label: "Applying preferences",
    value: "Your chips shape the recipe, shopping plan, swaps, and video searches.",
  },
  {
    label: "Building plan",
    value: "The final result includes recipe steps, estimated cost, and safety notes.",
  },
  {
    label: "Confidence",
    value: "Clear photos usually get higher confidence than blurry or cropped photos.",
  },
  {
    label: "Shopping",
    value: "Prices are rough ranges because every store and brand is different.",
  },
  {
    label: "Videos",
    value: "Links open YouTube searches so you can pick the tutorial you like.",
  },
];

export const starterDetailCards = [
  {
    label: "Confidence",
    value: "High, medium, and low explain how clear the food match is.",
  },
  {
    label: "Shopping",
    value: "Get rough price ranges and where each ingredient usually sits in stores.",
  },
  {
    label: "Preferences",
    value: "Budget, protein, allergy, time, and equipment notes change the plan.",
  },
  {
    label: "Swaps",
    value: "Missing something? SnapChef suggests practical ingredient replacements.",
  },
  {
    label: "Safety",
    value: "Results include allergy and food-safety reminders when useful.",
  },
  {
    label: "Videos",
    value: "Open YouTube searches for the cooking method instead of guessing.",
  },
];

export const foodIdeaTags = [
  "wraps",
  "rice bowls",
  "pasta",
  "salads",
  "tacos",
  "soups",
  "breakfast plates",
  "leftovers",
  "meal prep",
  "dorm meals",
  "budget dinners",
];

export const starterWorkflowSteps = [
  {
    label: "01",
    title: "Upload the food",
    detail: "Use a plate photo, menu screenshot, leftover container, or meal-prep picture.",
  },
  {
    label: "02",
    title: "Add your needs",
    detail: "Servings, budget, allergies, equipment, and time notes shape the final plan.",
  },
  {
    label: "03",
    title: "Cook with context",
    detail: "Review the dish, ingredients, price ranges, swaps, safety notes, and videos.",
  },
];

export const exampleResult: SnapChefResult = {
  dishName: "Tomato Basil Pasta",
  confidence: "medium",
  summary:
    "A bright weeknight pasta with tomato sauce, basil, garlic, olive oil, and parmesan-style finish.",
  ingredients: [
    { name: "Pasta", amount: "8 oz", note: "spaghetti, penne, or rigatoni" },
    { name: "Tomatoes", amount: "2 cups", note: "crushed, canned, or fresh" },
    { name: "Garlic", amount: "3 cloves", note: "minced" },
    { name: "Olive oil", amount: "2 tbsp" },
    { name: "Fresh basil", amount: "1 small handful" },
    { name: "Parmesan", amount: "1/3 cup", note: "optional" },
  ],
  recipe: {
    title: "Simple Tomato Basil Pasta",
    time: "25 minutes",
    difficulty: "Easy",
    servings: "2 servings",
    steps: [
      "Boil pasta in salted water until al dente, then reserve a small cup of pasta water.",
      "Warm olive oil in a pan and cook garlic for about 30 seconds.",
      "Add tomatoes, salt, and pepper, then simmer until the sauce thickens.",
      "Toss pasta into the sauce and loosen with reserved pasta water if needed.",
      "Finish with basil and parmesan before serving.",
    ],
  },
  substitutions: [
    "Use chickpea pasta for extra protein.",
    "Swap parmesan for nutritional yeast to keep it dairy-free.",
    "Add chili flakes for heat.",
  ],
  nutritionNotes: [
    "Tomatoes add vitamin C and lycopene.",
    "Add grilled chicken, tofu, or beans for more protein.",
  ],
  safetyNotes: ["Check labels for gluten or dairy allergens."],
  shoppingPlan: {
    estimatedTotal: "$10-$16 if buying the main items",
    estimatedPerServing: "about $5-$8 per serving",
    priceNote:
      "Prices are rough US grocery estimates and can change by store, brand, sales, and what is already in your kitchen.",
    items: [
      {
        name: "Pasta",
        amount: "8 oz",
        estimatedPrice: "$1-$2",
        whereToFind: "pasta aisle",
        note: "Store-brand pasta is usually the cheapest choice.",
      },
      {
        name: "Tomatoes",
        amount: "2 cups",
        estimatedPrice: "$1.50-$3",
        whereToFind: "canned goods or produce section",
        note: "Canned crushed tomatoes keep the cost low.",
      },
      {
        name: "Garlic",
        amount: "3 cloves",
        estimatedPrice: "$0.50-$1",
        whereToFind: "produce section",
        note: "One bulb covers several meals.",
      },
      {
        name: "Fresh basil",
        amount: "1 small handful",
        estimatedPrice: "$2-$4",
        whereToFind: "produce section",
        note: "Use dried Italian seasoning if basil is too expensive.",
      },
      {
        name: "Parmesan",
        amount: "1/3 cup",
        estimatedPrice: "$3-$5",
        whereToFind: "cheese or dairy section",
        note: "Optional if you need to cut the price.",
      },
    ],
    savingTips: [
      "Use canned tomatoes instead of fresh tomatoes for a cheaper sauce.",
      "Skip parmesan or use a small amount as a topping.",
      "Buy store-brand pasta and save the extra servings for another meal.",
    ],
  },
  nutritionEstimate: {
    calories: "520 calories",
    protein: "18g protein",
    carbs: "74g carbs",
    fat: "15g fat",
    note: "Estimated per serving. Actual nutrition changes with brands, portions, oil, cheese, and added protein.",
  },
  recipeVariants: [
    {
      title: "High-protein version",
      description: "Add grilled chicken, tofu, white beans, or chickpea pasta.",
      adjustment: "Keep the sauce the same and add protein during the final toss.",
    },
    {
      title: "Cheaper version",
      description: "Use canned tomatoes, dried herbs, and skip parmesan.",
      adjustment: "Add a little pasta water to make the sauce feel fuller.",
    },
    {
      title: "Spicy version",
      description: "Add chili flakes, calabrian chili, or hot sauce.",
      adjustment: "Bloom the spice in olive oil before adding tomatoes.",
    },
  ],
  appliedPreferences: ["college budget", "quick meal"],
  searchLinks: [
    {
      label: "Tomato basil pasta tutorial",
      url: "https://www.youtube.com/results?search_query=tomato+basil+pasta+recipe",
    },
    {
      label: "Easy pasta sauce from scratch",
      url: "https://www.youtube.com/results?search_query=easy+tomato+pasta+sauce+from+scratch",
    },
  ],
  exampleMode: true,
  notice: "This is a fixed example recipe. No photo was analyzed and no AI request was made.",
};
