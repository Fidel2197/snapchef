export const runtime = "nodejs";
export const maxDuration = 60;

type Ingredient = {
  name: string;
  amount?: string;
  note?: string;
};

type ShoppingItem = {
  name: string;
  amount?: string;
  estimatedPrice?: string;
  whereToFind?: string;
  note?: string;
};

type ShoppingPlan = {
  estimatedTotal: string;
  estimatedPerServing: string;
  priceNote: string;
  items: ShoppingItem[];
  savingTips: string[];
};

type SearchLink = {
  label: string;
  url: string;
};

type NutritionEstimate = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  note: string;
};

type RecipeVariant = {
  title: string;
  description: string;
  adjustment: string;
};

type SnapChefResult = {
  dishName: string;
  confidence: "high" | "medium" | "low";
  summary: string;
  ingredients: Ingredient[];
  recipe: {
    title: string;
    time: string;
    difficulty: string;
    servings: string;
    steps: string[];
  };
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

const exampleResult: SnapChefResult = {
  dishName: "Garlic Fried Rice Bowl",
  confidence: "medium",
  summary:
    "A savory rice bowl that likely uses cooked rice, garlic, vegetables, egg or protein, and a simple soy-style seasoning.",
  ingredients: [
    { name: "Cooked rice", amount: "2 cups", note: "day-old rice works best" },
    { name: "Garlic", amount: "3 cloves", note: "minced" },
    { name: "Mixed vegetables", amount: "1 cup" },
    { name: "Egg", amount: "1-2", note: "optional" },
    { name: "Soy sauce", amount: "1-2 tbsp" },
    { name: "Green onion", amount: "2 stalks" },
  ],
  recipe: {
    title: "Quick Garlic Fried Rice Bowl",
    time: "20 minutes",
    difficulty: "Easy",
    servings: "2 servings",
    steps: [
      "Heat oil in a wide pan and cook garlic until fragrant.",
      "Add vegetables and stir-fry until tender.",
      "Push vegetables aside, scramble the egg, then mix everything together.",
      "Add rice and soy sauce, then toss until hot and evenly seasoned.",
      "Finish with green onion and adjust salt or pepper before serving.",
    ],
  },
  substitutions: [
    "Use tofu instead of egg for a plant-based version.",
    "Use cauliflower rice for a lighter bowl.",
    "Add chili oil for more heat.",
  ],
  nutritionNotes: [
    "Add lean protein to make it more filling.",
    "Use low-sodium soy sauce if you are watching sodium.",
  ],
  safetyNotes: ["Reheat rice thoroughly and avoid leaving cooked rice out for long periods."],
  shoppingPlan: {
    estimatedTotal: "$8-$13 if buying the main items",
    estimatedPerServing: "about $4-$6.50 per serving",
    priceNote:
      "Prices are rough US grocery estimates and vary by store, brand, sales, and what you already have at home.",
    items: [
      {
        name: "Cooked rice",
        amount: "2 cups",
        estimatedPrice: "$1-$3",
        whereToFind: "rice or grains aisle",
        note: "A large bag is usually cheaper per serving.",
      },
      {
        name: "Garlic",
        amount: "3 cloves",
        estimatedPrice: "$0.50-$1",
        whereToFind: "produce section",
        note: "Jarred garlic works if you need speed.",
      },
      {
        name: "Mixed vegetables",
        amount: "1 cup",
        estimatedPrice: "$1.50-$3",
        whereToFind: "frozen vegetables or produce section",
        note: "Frozen vegetables are usually budget-friendly.",
      },
      {
        name: "Egg",
        amount: "1-2",
        estimatedPrice: "$0.50-$1.50",
        whereToFind: "dairy or egg section",
        note: "Use tofu or beans if avoiding eggs.",
      },
      {
        name: "Soy sauce",
        amount: "1-2 tbsp",
        estimatedPrice: "$2-$4",
        whereToFind: "international foods or condiment aisle",
        note: "One bottle covers many meals.",
      },
    ],
    savingTips: [
      "Use frozen vegetables to keep the cost predictable.",
      "Cook extra rice once and use it for multiple meals.",
      "Skip specialty toppings if the goal is the cheapest version.",
    ],
  },
  nutritionEstimate: {
    calories: "480 calories",
    protein: "16g protein",
    carbs: "68g carbs",
    fat: "14g fat",
    note: "Estimated per serving. Actual nutrition changes with portions, oil, sauces, and added protein.",
  },
  recipeVariants: [
    {
      title: "High-protein version",
      description: "Add chicken, tofu, edamame, or extra egg.",
      adjustment: "Cook the protein first, then fold it into the rice at the end.",
    },
    {
      title: "Cheaper version",
      description: "Use frozen vegetables and store-brand rice.",
      adjustment: "Keep seasonings simple with soy sauce, garlic, and green onion.",
    },
    {
      title: "Spicy version",
      description: "Add chili oil, sriracha, or crushed red pepper.",
      adjustment: "Start with a small amount and add more after tasting.",
    },
  ],
  appliedPreferences: ["college budget", "quick meal"],
  searchLinks: [
    {
      label: "Garlic fried rice recipe",
      url: "https://www.youtube.com/results?search_query=garlic+fried+rice+recipe",
    },
    {
      label: "Easy rice bowl tutorial",
      url: "https://www.youtube.com/results?search_query=easy+rice+bowl+recipe",
    },
  ],
  exampleMode: true,
  notice: "Connect Gemini to enable live image analysis.",
};

const snapChefSchema = {
  type: "object",
  properties: {
    dishName: { type: "string", description: "The most likely dish name." },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"],
      description: "How confident the model is in the dish identification.",
    },
    summary: { type: "string", description: "One short paragraph summarizing the dish." },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          amount: { type: "string" },
          note: { type: "string" },
        },
        required: ["name", "amount"],
      },
    },
    recipe: {
      type: "object",
      properties: {
        title: { type: "string" },
        time: { type: "string" },
        difficulty: { type: "string", enum: ["Easy", "Medium", "Advanced"] },
        servings: { type: "string" },
        steps: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["title", "time", "difficulty", "servings", "steps"],
    },
    substitutions: {
      type: "array",
      items: { type: "string" },
    },
    nutritionNotes: {
      type: "array",
      items: { type: "string" },
    },
    safetyNotes: {
      type: "array",
      items: { type: "string" },
    },
    searchLinks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          url: { type: "string" },
        },
        required: ["label", "url"],
      },
    },
    shoppingPlan: {
      type: "object",
      properties: {
        estimatedTotal: { type: "string" },
        estimatedPerServing: { type: "string" },
        priceNote: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              amount: { type: "string" },
              estimatedPrice: { type: "string" },
              whereToFind: { type: "string" },
              note: { type: "string" },
            },
            required: ["name", "amount", "estimatedPrice", "whereToFind"],
          },
        },
        savingTips: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["estimatedTotal", "estimatedPerServing", "priceNote", "items", "savingTips"],
    },
    nutritionEstimate: {
      type: "object",
      properties: {
        calories: { type: "string" },
        protein: { type: "string" },
        carbs: { type: "string" },
        fat: { type: "string" },
        note: { type: "string" },
      },
      required: ["calories", "protein", "carbs", "fat", "note"],
    },
    recipeVariants: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          adjustment: { type: "string" },
        },
        required: ["title", "description", "adjustment"],
      },
    },
    appliedPreferences: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "dishName",
    "confidence",
    "summary",
    "ingredients",
    "recipe",
    "substitutions",
    "nutritionNotes",
    "safetyNotes",
    "searchLinks",
    "shoppingPlan",
    "nutritionEstimate",
    "recipeVariants",
    "appliedPreferences",
  ],
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const preferences = String(formData.get("preferences") || "").trim();
  const servings = String(formData.get("servings") || "2").trim();
  const groceryLocation = String(formData.get("groceryLocation") || "").trim().slice(0, 80);

  if (!(image instanceof File)) {
    return Response.json({ error: "Image file is required." }, { status: 400 });
  }

  if (!image.type.startsWith("image/")) {
    return Response.json({ error: "Please upload an image file." }, { status: 400 });
  }

  if (image.size > 8 * 1024 * 1024) {
    return Response.json({ error: "Please upload an image under 8 MB." }, { status: 400 });
  }

  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    return analyzeWithGemini(image, { groceryLocation, preferences, servings });
  }

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return analyzeWithOpenAI(image, { groceryLocation, preferences, servings });
  }

  if (process.env.GEMINI_API_KEY) {
    return analyzeWithGemini(image, { groceryLocation, preferences, servings });
  }

  if (process.env.OPENAI_API_KEY) {
    return analyzeWithOpenAI(image, { groceryLocation, preferences, servings });
  }

  return Response.json({
    ...exampleResult,
    notice: "Connect Gemini to enable live image analysis.",
  });
}

async function analyzeWithOpenAI(
  image: File,
  {
    groceryLocation,
    preferences,
    servings,
  }: { groceryLocation: string; preferences: string; servings: string },
) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(exampleResult);
  }

  const dataUrl = await fileToDataUrl(image);
  const prompt = buildPrompt({ groceryLocation, preferences, servings });
  const model = process.env.OPENAI_MODEL || "gpt-5.5";

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: dataUrl },
          ],
        },
      ],
      max_output_tokens: 3000,
    }),
  });

  const payload = await openaiResponse.json();

  if (!openaiResponse.ok) {
    const message =
      payload?.error?.message ||
      "OpenAI could not analyze the image. Check your API key, credits, and model access.";
    return Response.json({ error: message }, { status: openaiResponse.status });
  }

  const text = extractOutputText(payload);
  const parsed = parseResult(text);

  if (!parsed) {
    return Response.json(
      { error: "The model response was not valid recipe JSON. Try another image." },
      { status: 502 },
    );
  }

  return Response.json(normalizeResult(parsed, { preferences }));
}

async function analyzeWithGemini(
  image: File,
  {
    groceryLocation,
    preferences,
    servings,
  }: { groceryLocation: string; preferences: string; servings: string },
) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(exampleResult);
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = buildPrompt({ groceryLocation, preferences, servings });
  const base64 = await fileToBase64(image);
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: image.type,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 3000,
          responseMimeType: "application/json",
          responseJsonSchema: snapChefSchema,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    },
  );

  const payload = await geminiResponse.json();

  if (!geminiResponse.ok) {
    const message =
      payload?.error?.message ||
      "Gemini could not analyze the image. Check your API key, quota, and model access.";
    return Response.json({ error: message }, { status: geminiResponse.status });
  }

  const text = extractGeminiText(payload);
  const parsed = parseResult(text);

  if (!parsed) {
    return Response.json(
      { error: "The Gemini response was not valid recipe JSON. Try another image." },
      { status: 502 },
    );
  }

  return Response.json(normalizeResult(parsed, { preferences }));
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

async function fileToBase64(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}

function buildPrompt({
  groceryLocation,
  preferences,
  servings,
}: {
  groceryLocation: string;
  preferences: string;
  servings: string;
}) {
  return `Analyze this food image for SnapChef.

Return only valid JSON. Do not wrap it in markdown.

JSON shape:
{
  "dishName": "string",
  "confidence": "high" | "medium" | "low",
  "summary": "one short paragraph",
  "ingredients": [{"name": "string", "amount": "string", "note": "string"}],
  "recipe": {
    "title": "string",
    "time": "string",
    "difficulty": "Easy" | "Medium" | "Advanced",
    "servings": "string",
    "steps": ["string"]
  },
  "substitutions": ["string"],
  "nutritionNotes": ["string"],
  "safetyNotes": ["string"],
  "searchLinks": [{"label": "string", "url": "https://www.youtube.com/results?search_query=..."}],
  "shoppingPlan": {
    "estimatedTotal": "string",
    "estimatedPerServing": "string",
    "priceNote": "string",
    "items": [
      {
        "name": "string",
        "amount": "string",
        "estimatedPrice": "string",
        "whereToFind": "string",
        "note": "string"
      }
    ],
    "savingTips": ["string"]
  },
  "nutritionEstimate": {
    "calories": "string",
    "protein": "string",
    "carbs": "string",
    "fat": "string",
    "note": "string"
  },
  "recipeVariants": [
    {
      "title": "High-protein version | Cheaper version | Spicy version | Vegetarian version | Creamy version",
      "description": "string",
      "adjustment": "string"
    }
  ],
  "appliedPreferences": ["string"]
}

Use ${servings || "2"} servings.
Preferences: ${preferences || "none"}.
Grocery area: ${groceryLocation || "not provided"}.
Preferences should guide the recipe plan, substitutions, shopping estimates, nutrition angle, cooking method, and search links. They should not override what is visible in the photo. For example, if the user asks for vegetarian but meat is visible, identify the image honestly and suggest vegetarian swaps.
For shoppingPlan, include rough grocery price ranges, not exact or live prices. If a grocery area is provided, tailor the ranges, store examples, and whereToFind notes to that region when possible. If the area is outside the US or unclear, avoid assuming Walmart/Aldi/Kroger are available and use general local market, supermarket, campus pantry, produce market, or discount grocer language instead.
If a grocery area is provided, priceNote must mention that estimates are area-aware rough estimates and that exact shelf prices, sales, brands, taxes, and availability still vary.
For nutritionEstimate, return rough estimated per-serving values only. Do not imply medical precision.
For recipeVariants, include 3-5 useful alternate ways to make the same likely dish, such as high-protein, cheaper, spicy, vegetarian, dorm-friendly, microwave, air-fryer, creamy, or faster versions when relevant.
If the exact dish is uncertain, make the best likely guess and set confidence to low or medium.
Search links must be YouTube search URLs, not individual video URLs.
Do not claim exact calories, real-time grocery prices, exact store availability, or current sales. Include clear allergy uncertainty when useful: hidden ingredients may not be visible and labels should be checked.`;
}

function extractOutputText(payload: unknown) {
  if (isRecord(payload) && typeof payload.output_text === "string") {
    return payload.output_text;
  }

  if (!isRecord(payload) || !Array.isArray(payload.output)) {
    return "";
  }

  return payload.output
    .flatMap((item) => (isRecord(item) && Array.isArray(item.content) ? item.content : []))
    .map((content) => {
      if (!isRecord(content)) {
        return "";
      }
      if (typeof content.text === "string") {
        return content.text;
      }
      if (typeof content.output_text === "string") {
        return content.output_text;
      }
      return "";
    })
    .join("")
    .trim();
}

function extractGeminiText(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.candidates)) {
    return "";
  }

  return payload.candidates
    .flatMap((candidate) => {
      if (!isRecord(candidate) || !isRecord(candidate.content)) {
        return [];
      }
      return Array.isArray(candidate.content.parts) ? candidate.content.parts : [];
    })
    .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

function parseResult(text: string): Partial<SnapChefResult> | null {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as Partial<SnapChefResult>;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]) as Partial<SnapChefResult>;
    } catch {
      return null;
    }
  }
}

function normalizeResult(
  result: Partial<SnapChefResult>,
  context: { preferences?: string } = {},
): SnapChefResult {
  const dishName = fallbackString(result.dishName, "Unknown dish");
  const searchTerm = encodeURIComponent(`${dishName} recipe`);
  const ingredients = normalizeIngredients(result.ingredients);

  return {
    dishName,
    confidence:
      result.confidence === "high" || result.confidence === "medium" || result.confidence === "low"
        ? result.confidence
        : "medium",
    summary: fallbackString(result.summary, "SnapChef found a likely recipe path for this dish."),
    ingredients,
    recipe: {
      title: fallbackString(result.recipe?.title, `How to make ${dishName}`),
      time: fallbackString(result.recipe?.time, "30 minutes"),
      difficulty: fallbackString(result.recipe?.difficulty, "Easy"),
      servings: fallbackString(result.recipe?.servings, "2 servings"),
      steps: normalizeStringList(result.recipe?.steps, [
        "Prepare the ingredients.",
        "Cook everything until done.",
        "Taste, adjust seasoning, and serve.",
      ]),
    },
    substitutions: normalizeStringList(result.substitutions, []),
    nutritionNotes: normalizeStringList(result.nutritionNotes, []),
    safetyNotes: normalizeStringList(result.safetyNotes, [
      "Image-based results are estimates; check ingredients for allergens.",
    ]),
    searchLinks:
      result.searchLinks?.length ? normalizeLinks(result.searchLinks) : defaultLinks(dishName, searchTerm),
    shoppingPlan: normalizeShoppingPlan(result.shoppingPlan, ingredients),
    nutritionEstimate: normalizeNutritionEstimate(result.nutritionEstimate),
    recipeVariants: normalizeRecipeVariants(result.recipeVariants, dishName),
    appliedPreferences: normalizeAppliedPreferences(
      result.appliedPreferences,
      context.preferences || "",
    ),
  };
}

function normalizeIngredients(ingredients?: Ingredient[]) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return [{ name: "Main ingredients", amount: "as needed", note: "estimated from image" }];
  }

  return ingredients.slice(0, 12).map((ingredient) => ({
    name: fallbackString(ingredient.name, "Ingredient"),
    amount: fallbackString(ingredient.amount, "to taste"),
    note: fallbackString(ingredient.note, ""),
  }));
}

function normalizeStringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, 10);
}

function normalizeLinks(value: SearchLink[]) {
  return value
    .filter((link) => link.url?.startsWith("https://www.youtube.com/results?search_query="))
    .slice(0, 4)
    .map((link) => ({
      label: fallbackString(link.label, "Watch tutorial"),
      url: link.url,
    }));
}

function normalizeShoppingPlan(
  shoppingPlan: Partial<ShoppingPlan> | undefined,
  ingredients: Ingredient[],
): ShoppingPlan {
  const fallbackItems = ingredients.slice(0, 8).map((ingredient) => ({
    name: ingredient.name,
    amount: ingredient.amount || "as needed",
    estimatedPrice: "varies",
    whereToFind: "grocery store",
    note: ingredient.note || "Estimate based on the image and recipe plan.",
  }));

  const items = Array.isArray(shoppingPlan?.items)
    ? shoppingPlan.items.slice(0, 10).map((item) => ({
        name: fallbackString(item.name, "Ingredient"),
        amount: fallbackString(item.amount, "as needed"),
        estimatedPrice: fallbackString(item.estimatedPrice, "varies"),
        whereToFind: fallbackString(item.whereToFind, "grocery store"),
        note: fallbackString(item.note, ""),
      }))
    : fallbackItems;

  return {
    estimatedTotal: fallbackString(shoppingPlan?.estimatedTotal, "price varies by store"),
    estimatedPerServing: fallbackString(shoppingPlan?.estimatedPerServing, "depends on serving size"),
    priceNote: fallbackString(
      shoppingPlan?.priceNote,
      "Prices are rough estimates and vary by store, brand, sales, and what you already own.",
    ),
    items: items.length ? items : fallbackItems,
    savingTips: normalizeStringList(shoppingPlan?.savingTips, [
      "Compare store brands before buying name-brand ingredients.",
      "Use pantry staples you already have before buying every listed item.",
    ]),
  };
}

function normalizeNutritionEstimate(value?: Partial<NutritionEstimate>): NutritionEstimate {
  return {
    calories: fallbackString(value?.calories, "estimate varies"),
    protein: fallbackString(value?.protein, "protein varies"),
    carbs: fallbackString(value?.carbs, "carbs vary"),
    fat: fallbackString(value?.fat, "fat varies"),
    note: fallbackString(
      value?.note,
      "Estimated per serving. Actual nutrition changes with portions, brands, cooking oil, sauces, and substitutions.",
    ),
  };
}

function normalizeRecipeVariants(value: unknown, dishName: string): RecipeVariant[] {
  if (Array.isArray(value)) {
    const variants = value
      .filter((item): item is Partial<RecipeVariant> => isRecord(item))
      .map((item) => ({
        title: fallbackString(item.title, "Alternate version"),
        description: fallbackString(item.description, `Another way to make ${dishName}.`),
        adjustment: fallbackString(item.adjustment, "Adjust ingredients and cooking method to fit your needs."),
      }))
      .slice(0, 5);

    if (variants.length) {
      return variants;
    }
  }

  return [
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
  ];
}

function normalizeAppliedPreferences(value: unknown, preferences: string) {
  const fromModel = normalizeStringList(value, []);

  if (fromModel.length) {
    return fromModel.slice(0, 8);
  }

  return preferences
    .split(",")
    .map((preference) => preference.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function defaultLinks(dishName: string, searchTerm: string) {
  return [
    {
      label: `${dishName} recipe tutorial`,
      url: `https://www.youtube.com/results?search_query=${searchTerm}`,
    },
    {
      label: `${dishName} beginner recipe`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${dishName} beginner recipe`)}`,
    },
  ];
}

function fallbackString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
