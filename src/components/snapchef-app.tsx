"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import styles from "./snapchef-app.module.css";

type Confidence = "high" | "medium" | "low";

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

type Recipe = {
  title: string;
  time: string;
  difficulty: string;
  servings: string;
  steps: string[];
};

type SearchLink = {
  label: string;
  url: string;
};

type SnapChefResult = {
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
  appliedPreferences: string[];
  exampleMode?: boolean;
  notice?: string;
};

type ApiError = {
  error: string;
};

type ResultTab = "recipe" | "ingredients" | "shopping" | "videos";

const preferencePresets = [
  { label: "College budget", value: "college budget, cheap ingredients, price estimates" },
  { label: "High protein", value: "high protein, filling, meal prep friendly" },
  { label: "Vegetarian", value: "vegetarian, no meat, beginner friendly" },
  { label: "Spicy", value: "spicy, bold flavor, easy swaps" },
  { label: "15-minute", value: "15 minute meal, minimal prep, quick cleanup" },
  { label: "Dairy-free", value: "dairy free, avoid milk cheese butter cream" },
  { label: "No peanuts", value: "no peanuts, peanut allergy aware" },
  { label: "Meal prep", value: "meal prep friendly, leftovers, reheats well" },
];

const confidenceGuide = [
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

const previewTiles = [
  { label: "Dish", value: "Likely match" },
  { label: "Ingredients", value: "Pantry list" },
  { label: "Budget", value: "Price ranges" },
  { label: "Shopping", value: "Where to find it" },
  { label: "Steps", value: "Cookable plan" },
  { label: "Videos", value: "Search links" },
];

const storyCards = [
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

const prepGuideCards = [
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

const scanGuideCards = [
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

const starterDetailCards = [
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

const exampleResult: SnapChefResult = {
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
};

export default function SnapChefApp() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customPreferences, setCustomPreferences] = useState("");
  const [servings, setServings] = useState("2");
  const [result, setResult] = useState<SnapChefResult | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("recipe");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const confidenceText = useMemo(() => {
    if (!result) {
      return "Ready to scan";
    }

    return `${result.confidence[0].toUpperCase()}${result.confidence.slice(1)} confidence`;
  }, [result]);

  const preferences = useMemo(
    () => [...selectedPresets, customPreferences.trim()].filter(Boolean).join(", "),
    [customPreferences, selectedPresets],
  );

  const activePreferenceSummary = useMemo(() => {
    const selectedLabels = preferencePresets
      .filter((preset) => selectedPresets.includes(preset.value))
      .map((preset) => preset.label);

    return [...selectedLabels, customPreferences.trim()].filter(Boolean).join(", ");
  }, [customPreferences, selectedPresets]);

  const resultPhoto = previewUrl || "/snapchef-food-board.png";
  const isScanActive = isAnalyzing || Boolean(result);

  function togglePreset(value: string) {
    setSelectedPresets((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function chooseFile(selectedFile?: File) {
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (selectedFile.size > 8 * 1024 * 1024) {
      setError("Please choose an image under 8 MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    chooseFile(event.dataTransfer.files?.[0]);
  }

  async function analyzeImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Choose a food image first.");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("preferences", preferences);
    formData.append("servings", servings);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as SnapChefResult | ApiError;

      if (!response.ok || isApiError(data)) {
        const message = isApiError(data) ? data.error : "SnapChef could not analyze that image.";
        throw new Error(message);
      }

      setResult(data as SnapChefResult);
      setActiveTab("recipe");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function loadExample() {
    setResult(exampleResult);
    setActiveTab("recipe");
    setError("");
  }

  function resetScan() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    setSelectedPresets([]);
    setCustomPreferences("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <main className={`${styles.shell} ${isScanActive ? styles.activeShell : ""}`}>
      <section className={styles.workspace}>
        <header className={styles.appHeader}>
          <div className={styles.logoLockup}>
            <span className={styles.logoMark}>SC</span>
            <span>SnapChef</span>
          </div>
          <span className={styles.statusBadge}>{confidenceText}</span>
        </header>

        {isAnalyzing ? (
          <ScanProgress
            activePreferenceSummary={activePreferenceSummary}
            resultPhoto={resultPhoto}
          />
        ) : null}

        {result ? (
          <ScanSummary
            activePreferenceSummary={activePreferenceSummary}
            onReset={resetScan}
            result={result}
            resultPhoto={resultPhoto}
          />
        ) : null}

        {!isScanActive ? (
          <div className={styles.heroGrid}>
            <div className={styles.brandBar}>
              <p className={styles.eyebrow}>Food photo to recipe</p>
              <h1>Turn a food photo into dinner plans.</h1>
              <p className={styles.subtitle}>
                Upload a plate, get a likely dish, ingredient list, recipe steps, swaps, and
                cooking video searches.
              </p>
              <div className={styles.metricRow} aria-label="SnapChef capabilities">
                <span>Dish ID</span>
                <span>Estimated prices</span>
                <span>Recipe steps</span>
              </div>
              <div className={styles.storyGrid} aria-label="SnapChef flow">
                {storyCards.map((card) => (
                  <article
                    className={styles.storyCard}
                    key={card.title}
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(10, 24, 18, 0.06), rgba(10, 24, 18, 0.78)), url(${card.image})`,
                    }}
                  >
                    <div>
                      <strong>{card.title}</strong>
                      <span>{card.detail}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <form className={styles.scanPanel} onSubmit={analyzeImage}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Image scan</p>
              <h2>{isScanActive ? "Refine or start over" : "Start with a food photo"}</h2>
            </div>
            <button className={styles.ghostButton} type="button" onClick={loadExample}>
              See example
            </button>
          </div>

          <label
            className={`${styles.dropzone} ${previewUrl ? styles.hasPreview : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <span
                className={styles.previewImage}
                role="img"
                aria-label="Selected food"
                style={{ backgroundImage: `url(${previewUrl})` }}
              />
            ) : (
              <span className={styles.dropzoneContent}>
                <span className={styles.dropIcon}>+</span>
                <span className={styles.dropzoneTitle}>Upload food image</span>
                <span className={styles.dropzoneMeta}>JPG, PNG, or WebP under 8 MB</span>
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>

          <div className={styles.controls}>
            <label className={styles.field}>
              <span>Servings</span>
              <input
                type="number"
                min="1"
                max="12"
                value={servings}
                onChange={(event) => setServings(event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Extra notes</span>
              <input
                value={customPreferences}
                onChange={(event) => setCustomPreferences(event.target.value)}
                placeholder="no pork, dorm kitchen, air fryer, no peanuts"
              />
            </label>
          </div>

          <div className={styles.preferenceBlock}>
            <div className={styles.preferenceHeader}>
              <div>
                <p className={styles.eyebrow}>Preferences</p>
                <h3>Choose what should shape the result</h3>
              </div>
              {activePreferenceSummary ? (
                <button className={styles.clearPresetButton} type="button" onClick={() => {
                  setSelectedPresets([]);
                  setCustomPreferences("");
                }}>
                  Clear
                </button>
              ) : null}
            </div>
            <p className={styles.helperText}>
              The photo still decides the dish. These options adjust the recipe, swaps, shopping
              estimates, and video searches after SnapChef identifies it.
            </p>
            <div className={styles.presetRow} aria-label="Preference presets">
              {preferencePresets.map((preset) => (
                <button
                  aria-pressed={selectedPresets.includes(preset.value)}
                  className={selectedPresets.includes(preset.value) ? styles.selectedPreset : ""}
                  key={preset.label}
                  onClick={() => togglePreset(preset.value)}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {activePreferenceSummary ? (
              <div className={styles.activePreferenceBar}>
                <span>Active</span>
                <strong>{activePreferenceSummary}</strong>
              </div>
            ) : null}
          </div>

          <div className={styles.actionRow}>
            <button className={styles.primaryButton} disabled={isAnalyzing} type="submit">
              {isAnalyzing ? "Analyzing..." : "Analyze image"}
            </button>
            <button className={styles.secondaryButton} type="button" onClick={resetScan}>
              Reset
            </button>
          </div>

          {error ? <p className={styles.errorText}>{error}</p> : null}
        </form>

        <SidebarGuide
          activePreferenceSummary={activePreferenceSummary}
          isAnalyzing={isAnalyzing}
          result={result}
        />
      </section>

      <section className={styles.resultPanel} aria-live="polite">
        <div className={styles.resultCanvas}>
          {result ? (
            <>
              <div
                className={styles.resultPhoto}
                role="img"
                aria-label={previewUrl ? "Uploaded food preview" : "Food spread"}
                style={{ backgroundImage: `url(${resultPhoto})` }}
              >
                <span>{result.exampleMode ? "Example result" : "Your scan"}</span>
              </div>

              <div className={styles.resultHeader}>
                <div>
                  <p className={styles.eyebrow}>Detected dish</p>
                  <h2>{result.dishName}</h2>
                </div>
                <span className={styles.confidencePill}>{result.confidence}</span>
              </div>
              <p className={styles.summary}>{result.summary}</p>

              {result.notice ? <p className={styles.notice}>{result.notice}</p> : null}

              <ConfidenceGuide confidence={result.confidence} />

              {result.appliedPreferences?.length ? (
                <div className={styles.appliedPreferences}>
                  <span>Preferences used</span>
                  <strong>{result.appliedPreferences.join(", ")}</strong>
                </div>
              ) : null}

              <div className={styles.insightStrip}>
                <span>{result.ingredients.length} ingredients</span>
                <span>{result.recipe.time}</span>
                <span>{result.shoppingPlan.estimatedPerServing}</span>
                <span>{result.searchLinks.length} video searches</span>
              </div>

              <div className={styles.tabs} role="tablist" aria-label="SnapChef result sections">
                <button
                  className={activeTab === "recipe" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("recipe")}
                  type="button"
                >
                  Recipe
                </button>
                <button
                  className={activeTab === "ingredients" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("ingredients")}
                  type="button"
                >
                  Ingredients
                </button>
                <button
                  className={activeTab === "shopping" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("shopping")}
                  type="button"
                >
                  Shopping
                </button>
                <button
                  className={activeTab === "videos" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("videos")}
                  type="button"
                >
                  Videos
                </button>
              </div>

              {activeTab === "recipe" ? <RecipeView result={result} /> : null}
              {activeTab === "ingredients" ? <IngredientsView result={result} /> : null}
              {activeTab === "shopping" ? <ShoppingView result={result} /> : null}
              {activeTab === "videos" ? <VideosView result={result} /> : null}
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyPhoto} aria-hidden="true">
                <div>
                  <span>What you get</span>
                  <strong>Recipes from the food already in front of you</strong>
                </div>
              </div>

              <div>
                <p className={styles.eyebrow}>Recipe workspace</p>
                <h2>Ready when your plate is.</h2>
                <p className={styles.summary}>
                  SnapChef turns a food image into a practical cooking plan with ingredients,
                  steps, swaps, and videos.
                </p>
              </div>

              <div className={styles.emptyGrid}>
                {previewTiles.map((tile) => (
                  <span key={tile.label}>
                    <small>{tile.label}</small>
                    <strong>{tile.value}</strong>
                  </span>
                ))}
              </div>

              <button className={styles.exampleButton} type="button" onClick={loadExample}>
                See an example result
              </button>

              <div className={styles.starterDetails}>
                <GuideGrid cards={starterDetailCards} />
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function RecipeView({ result }: { result: SnapChefResult }) {
  return (
    <div className={styles.recipeView}>
      <div className={styles.recipeStats}>
        <span>{result.recipe.time}</span>
        <span>{result.recipe.difficulty}</span>
        <span>{result.recipe.servings}</span>
      </div>
      <h3>{result.recipe.title}</h3>
      <ol className={styles.stepList}>
        {result.recipe.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function ScanProgress({
  activePreferenceSummary,
  resultPhoto,
}: {
  activePreferenceSummary: string;
  resultPhoto: string;
}) {
  return (
    <section className={styles.scanProgress}>
      <div
        className={styles.scanSummaryPhoto}
        role="img"
        aria-label="Selected food being analyzed"
        style={{ backgroundImage: `url(${resultPhoto})` }}
      >
        <span>Analyzing</span>
      </div>
      <div className={styles.scanProgressBody}>
        <p className={styles.eyebrow}>Current scan</p>
        <h2>Building your recipe plan.</h2>
        <div className={styles.progressMeter} aria-hidden="true">
          <span />
        </div>
        <div className={styles.progressSteps}>
          <span>Dish match</span>
          <span>Ingredient list</span>
          <span>Budget estimate</span>
          <span>Cooking steps</span>
        </div>
        {activePreferenceSummary ? (
          <p className={styles.scanSummaryNote}>{activePreferenceSummary}</p>
        ) : null}
      </div>
    </section>
  );
}

function ScanSummary({
  activePreferenceSummary,
  onReset,
  result,
  resultPhoto,
}: {
  activePreferenceSummary: string;
  onReset: () => void;
  result: SnapChefResult;
  resultPhoto: string;
}) {
  return (
    <section className={styles.scanSummary}>
      <div
        className={styles.scanSummaryPhoto}
        role="img"
        aria-label="Current food scan"
        style={{ backgroundImage: `url(${resultPhoto})` }}
      >
        <span>Current scan</span>
      </div>
      <div className={styles.scanSummaryBody}>
        <div>
          <p className={styles.eyebrow}>Result snapshot</p>
          <h2>{result.dishName}</h2>
          <p>{result.summary}</p>
        </div>
        <div className={styles.scanSummaryStats}>
          <span>
            <small>Confidence</small>
            <strong>{result.confidence}</strong>
          </span>
          <span>
            <small>Time</small>
            <strong>{result.recipe.time}</strong>
          </span>
          <span>
            <small>Cost</small>
            <strong>{result.shoppingPlan.estimatedPerServing}</strong>
          </span>
        </div>
        {activePreferenceSummary || result.appliedPreferences?.length ? (
          <p className={styles.scanSummaryNote}>
            {activePreferenceSummary || result.appliedPreferences.join(", ")}
          </p>
        ) : null}
        <button className={styles.secondaryButton} type="button" onClick={onReset}>
          New scan
        </button>
      </div>
    </section>
  );
}

function SidebarGuide({
  activePreferenceSummary,
  isAnalyzing,
  result,
}: {
  activePreferenceSummary: string;
  isAnalyzing: boolean;
  result: SnapChefResult | null;
}) {
  if (result) {
    const cards = [
      {
        label: "Confidence",
        value: `${result.confidence} match. Use the guide on the right to decide how much to trust it.`,
      },
      {
        label: "Budget",
        value: `${result.shoppingPlan.estimatedPerServing}. Open Shopping for stores, ranges, and saving tips.`,
      },
      {
        label: "Next move",
        value: "Review the ingredients first, then follow the recipe steps in order.",
      },
      {
        label: "Video help",
        value: `${result.searchLinks.length} YouTube searches are ready if you want to watch the method.`,
      },
      {
        label: "Safety",
        value: result.safetyNotes[0] || "Check allergens and cook proteins to a safe temperature.",
      },
      {
        label: "Swaps",
        value: result.substitutions[0] || "Use the substitutions list if an ingredient is missing.",
      },
    ];

    return (
      <section className={styles.sidebarGuide}>
        <div className={styles.sidebarGuideHeader}>
          <p className={styles.eyebrow}>Result checklist</p>
          <h2>What to check next.</h2>
        </div>
        <GuideGrid cards={cards} />
      </section>
    );
  }

  return (
    <section className={styles.sidebarGuide}>
      <div className={styles.sidebarGuideHeader}>
        <p className={styles.eyebrow}>{isAnalyzing ? "While it works" : "Before you scan"}</p>
        <h2>{isAnalyzing ? "What SnapChef is checking." : "Make the result better."}</h2>
      </div>
      <GuideGrid cards={isAnalyzing ? scanGuideCards : prepGuideCards} />
      {activePreferenceSummary ? (
        <div className={styles.sidebarCallout}>
          <span>Active preferences</span>
          <strong>{activePreferenceSummary}</strong>
        </div>
      ) : (
        <div className={styles.sidebarCallout}>
          <span>Tip</span>
          <strong>Add budget, allergy, equipment, or time notes before scanning.</strong>
        </div>
      )}
    </section>
  );
}

function GuideGrid({ cards }: { cards: { label: string; value: string }[] }) {
  return (
    <div className={styles.guideGrid}>
      {cards.map((card) => (
        <span key={card.label}>
          <small>{card.label}</small>
          <strong>{card.value}</strong>
        </span>
      ))}
    </div>
  );
}

function ConfidenceGuide({ confidence }: { confidence: Confidence }) {
  return (
    <div className={styles.confidenceGuide}>
      <div className={styles.confidenceGuideHeader}>
        <span>Confidence guide</span>
        <strong>{confidence} confidence means SnapChef is estimating from the photo.</strong>
      </div>
      <div className={styles.confidenceLevels}>
        {confidenceGuide.map((item) => (
          <span
            className={item.level === confidence ? styles.activeConfidence : ""}
            key={item.level}
          >
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
          </span>
        ))}
      </div>
    </div>
  );
}

function IngredientsView({ result }: { result: SnapChefResult }) {
  return (
    <div className={styles.ingredientsView}>
      <ul className={styles.ingredientGrid}>
        {result.ingredients.map((ingredient) => (
          <li key={`${ingredient.name}-${ingredient.amount ?? ""}`}>
            <strong>{ingredient.name}</strong>
            <span>{ingredient.amount || "to taste"}</span>
            {ingredient.note ? <small>{ingredient.note}</small> : null}
          </li>
        ))}
      </ul>
      <InfoList title="Substitutions" items={result.substitutions} />
      <InfoList title="Nutrition notes" items={result.nutritionNotes} />
      <InfoList title="Safety notes" items={result.safetyNotes} />
    </div>
  );
}

function ShoppingView({ result }: { result: SnapChefResult }) {
  return (
    <div className={styles.shoppingView}>
      <div className={styles.budgetSummary}>
        <span>
          <small>Estimated total</small>
          <strong>{result.shoppingPlan.estimatedTotal}</strong>
        </span>
        <span>
          <small>Per serving</small>
          <strong>{result.shoppingPlan.estimatedPerServing}</strong>
        </span>
      </div>
      <p className={styles.priceNote}>{result.shoppingPlan.priceNote}</p>

      <ul className={styles.shoppingGrid}>
        {result.shoppingPlan.items.map((item) => (
          <li key={`${item.name}-${item.amount ?? ""}`}>
            <div>
              <strong>{item.name}</strong>
              <span>{item.amount || "as needed"}</span>
            </div>
            <p>{item.estimatedPrice || "varies"}</p>
            <small>{item.whereToFind || "grocery store"}</small>
            {item.note ? <em>{item.note}</em> : null}
          </li>
        ))}
      </ul>

      <InfoList title="Money-saving tips" items={result.shoppingPlan.savingTips} />
    </div>
  );
}

function VideosView({ result }: { result: SnapChefResult }) {
  return (
    <div className={styles.videoList}>
      {result.searchLinks.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
          <span>{link.label}</span>
          <strong>Open YouTube search</strong>
        </a>
      ))}
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className={styles.infoBlock}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
}
