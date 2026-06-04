"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import styles from "./snapchef-app.module.css";

type Confidence = "high" | "medium" | "low";

type Ingredient = {
  name: string;
  amount?: string;
  note?: string;
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
  exampleMode?: boolean;
  notice?: string;
};

type ApiError = {
  error: string;
};

type ResultTab = "recipe" | "ingredients" | "videos";

const preferencePresets = [
  { label: "College budget", value: "college budget, quick, cheap ingredients" },
  { label: "High protein", value: "high protein, filling, meal prep friendly" },
  { label: "Vegetarian", value: "vegetarian, no meat, beginner friendly" },
  { label: "Spicy", value: "spicy, bold flavor, easy swaps" },
];

const previewTiles = [
  { label: "Dish", value: "Likely match" },
  { label: "Ingredients", value: "Pantry list" },
  { label: "Steps", value: "Cookable plan" },
  { label: "Videos", value: "Search links" },
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
  const [preferences, setPreferences] = useState("");
  const [servings, setServings] = useState("2");
  const [result, setResult] = useState<SnapChefResult | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("recipe");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const confidenceText = useMemo(() => {
    if (!result) {
      return "Ready";
    }

    return `${result.confidence[0].toUpperCase()}${result.confidence.slice(1)} confidence`;
  }, [result]);

  const resultPhoto = previewUrl || "/snapchef-food-board.png";

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <main className={styles.shell}>
      <section className={styles.workspace}>
        <header className={styles.appHeader}>
          <div className={styles.logoLockup}>
            <span className={styles.logoMark}>SC</span>
            <span>SnapChef</span>
          </div>
          <span className={styles.statusBadge}>{confidenceText}</span>
        </header>

        <div className={styles.heroGrid}>
          <div className={styles.brandBar}>
            <p className={styles.eyebrow}>Food photo to recipe</p>
            <h1>Turn a food photo into dinner plans.</h1>
            <p className={styles.subtitle}>
              Upload a plate, get a likely dish, ingredient list, recipe steps, swaps, and cooking
              video searches.
            </p>
            <div className={styles.metricRow} aria-label="SnapChef capabilities">
              <span>Dish ID</span>
              <span>Ingredients</span>
              <span>Recipe steps</span>
            </div>
          </div>
        </div>

        <form className={styles.scanPanel} onSubmit={analyzeImage}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Image scan</p>
              <h2>Start with a food photo</h2>
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
              <span>Preferences</span>
              <input
                value={preferences}
                onChange={(event) => setPreferences(event.target.value)}
                placeholder="budget, spicy, vegetarian, no peanuts"
              />
            </label>
          </div>

          <div className={styles.presetRow} aria-label="Preference presets">
            {preferencePresets.map((preset) => (
              <button
                className={preferences === preset.value ? styles.selectedPreset : ""}
                key={preset.label}
                onClick={() => setPreferences(preset.value)}
                type="button"
              >
                {preset.label}
              </button>
            ))}
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

              <div className={styles.insightStrip}>
                <span>{result.ingredients.length} ingredients</span>
                <span>{result.recipe.time}</span>
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
                  className={activeTab === "videos" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("videos")}
                  type="button"
                >
                  Videos
                </button>
              </div>

              {activeTab === "recipe" ? <RecipeView result={result} /> : null}
              {activeTab === "ingredients" ? <IngredientsView result={result} /> : null}
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
