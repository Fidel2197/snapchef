export const runtime = "nodejs";
export const maxDuration = 60;

type Ingredient = {
  name: string;
  amount?: string;
  note?: string;
};

type SearchLink = {
  label: string;
  url: string;
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
  demoMode?: boolean;
  notice?: string;
};

const sampleResult: SnapChefResult = {
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
  demoMode: true,
  notice: "Add OPENAI_API_KEY to .env.local to use real image analysis.",
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  const preferences = String(formData.get("preferences") || "").trim();
  const servings = String(formData.get("servings") || "2").trim();

  if (!(image instanceof File)) {
    return Response.json({ error: "Image file is required." }, { status: 400 });
  }

  if (!image.type.startsWith("image/")) {
    return Response.json({ error: "Please upload an image file." }, { status: 400 });
  }

  if (image.size > 8 * 1024 * 1024) {
    return Response.json({ error: "Please upload an image under 8 MB." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(sampleResult);
  }

  const dataUrl = await fileToDataUrl(image);
  const prompt = buildPrompt({ preferences, servings });
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
      max_output_tokens: 1800,
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

  return Response.json(normalizeResult(parsed));
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

function buildPrompt({ preferences, servings }: { preferences: string; servings: string }) {
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
  "searchLinks": [{"label": "string", "url": "https://www.youtube.com/results?search_query=..."}]
}

Use ${servings || "2"} servings.
Preferences: ${preferences || "none"}.
If the exact dish is uncertain, make the best likely guess and set confidence to low or medium.
Search links must be YouTube search URLs, not individual video URLs.
Do not claim exact calories. Mention allergy or food-safety uncertainty when useful.`;
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

function parseResult(text: string): Partial<SnapChefResult> | null {
  try {
    return JSON.parse(text) as Partial<SnapChefResult>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
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

function normalizeResult(result: Partial<SnapChefResult>): SnapChefResult {
  const dishName = fallbackString(result.dishName, "Unknown dish");
  const searchTerm = encodeURIComponent(`${dishName} recipe`);

  return {
    dishName,
    confidence:
      result.confidence === "high" || result.confidence === "medium" || result.confidence === "low"
        ? result.confidence
        : "medium",
    summary: fallbackString(result.summary, "SnapChef found a likely recipe path for this dish."),
    ingredients: normalizeIngredients(result.ingredients),
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
