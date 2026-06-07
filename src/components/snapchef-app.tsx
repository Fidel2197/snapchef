"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";
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

type SavedScan = {
  id: string;
  dish_name: string;
  confidence: Confidence;
  summary: string;
  result: SnapChefResult;
  image_path: string | null;
  created_at: string;
};

type ApiError = {
  error: string;
};

type ResultTab = "recipe" | "ingredients" | "shopping" | "nutrition" | "ideas" | "videos";
type MainView = "scan" | "history";

const preferencePresets = [
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

const foodIdeaTags = [
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

const starterWorkflowSteps = [
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
};

function getAuthRedirectUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/`;
}

export default function SnapChefApp() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customPreferences, setCustomPreferences] = useState("");
  const [servings, setServings] = useState("2");
  const [result, setResult] = useState<SnapChefResult | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("recipe");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [savedScans, setSavedScans] = useState<SavedScan[]>([]);
  const [selectedSavedScanId, setSelectedSavedScanId] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [isSavingScan, setIsSavingScan] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [mainView, setMainView] = useState<MainView>("scan");
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const [isEditingDishName, setIsEditingDishName] = useState(false);
  const [dishNameDraft, setDishNameDraft] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = session?.user ?? null;
  const displayName = user?.email?.split("@")[0] || "My recipes";

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

  function getSavedScanImageUrl(scan: SavedScan) {
    if (!scan.image_path || scan.image_path === "local-preview") {
      return "";
    }

    if (scan.image_path.startsWith("http")) {
      return scan.image_path;
    }

    return supabase?.storage.from("snapchef-scans").getPublicUrl(scan.image_path).data.publicUrl || "";
  }

  const loadSavedScans = useCallback(async (currentSession: Session | null) => {
    if (!supabase || !currentSession?.user) {
      setSavedScans([]);
      setHistoryError("");
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError("");

    const { data, error: loadError } = await supabase
      .from("snapchef_scans")
      .select("id,dish_name,confidence,summary,result,image_path,created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (loadError) {
      setHistoryError(loadError.message);
      setSavedScans([]);
    } else {
      setSavedScans(
        ((data ?? []) as SavedScan[]).map((scan) => ({
          ...scan,
          result: ensureClientResult(scan.result),
        })),
      );
    }

    setIsHistoryLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        void loadSavedScans(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      void loadSavedScans(currentSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadSavedScans, supabase]);

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
    setMainView("scan");
    setActionStatus("");
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

      const nextResult = ensureClientResult(data as SnapChefResult);
      setResult(nextResult);
      setDishNameDraft(nextResult.dishName);
      setSelectedSavedScanId(null);
      setSaveStatus("");
      setActionStatus("");
      setMainView("scan");
      setActiveTab("recipe");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function loadExample() {
    setResult(exampleResult);
    setDishNameDraft(exampleResult.dishName);
    setSelectedSavedScanId(null);
    setSaveStatus("");
    setActionStatus("");
    setMainView("scan");
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
    setSelectedSavedScanId(null);
    setSaveStatus("");
    setActionStatus("");
    setIsEditingDishName(false);
    setDishNameDraft("");
    setMainView("scan");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleAuth(mode: "signIn" | "signUp") {
    if (!supabase) {
      setAuthError("Add your Supabase URL and publishable key to .env.local, then restart.");
      return;
    }

    const email = authEmail.trim();

    if (!email || authPassword.length < 6) {
      setAuthError("Use an email and a password with at least 6 characters.");
      return;
    }

    setIsAuthBusy(true);
    setAuthError("");
    setAuthMessage("");

    const credentials = { email, password: authPassword };
    const authRedirectUrl = getAuthRedirectUrl();
    const { data, error: authActionError } =
      mode === "signUp"
        ? await supabase.auth.signUp({
            ...credentials,
            options: authRedirectUrl ? { emailRedirectTo: authRedirectUrl } : undefined,
          })
        : await supabase.auth.signInWithPassword(credentials);

    if (authActionError) {
      setAuthError(authActionError.message);
    } else if (mode === "signUp" && !data.session) {
      setAuthMessage("Account created. Check your email if Supabase asks for confirmation.");
    } else {
      setAuthMessage(mode === "signUp" ? "Account created and signed in." : "Signed in.");
      setAuthPassword("");
    }

    setIsAuthBusy(false);
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSavedScans([]);
    setSelectedSavedScanId(null);
    setSaveStatus("");
    setAuthMessage("Signed out.");
  }

  async function uploadScanImageForHistory() {
    if (!supabase || !user || !file) {
      return { path: null, error: "" };
    }

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("snapchef-scans")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { path: null, error: uploadError.message };
    }

    return { path, error: "" };
  }

  async function saveCurrentScan() {
    if (!supabase || !user || !result) {
      setSaveStatus("Sign in first, then save this scan.");
      return;
    }

    if (result.exampleMode) {
      setSaveStatus("Example results are not saved. Upload a food photo first.");
      return;
    }

    setIsSavingScan(true);
    setSaveStatus("");
    const uploadedImage = await uploadScanImageForHistory();

    const { data, error: saveError } = await supabase
      .from("snapchef_scans")
      .insert({
        user_id: user.id,
        dish_name: result.dishName,
        confidence: result.confidence,
        summary: result.summary,
        result,
        image_path: uploadedImage.path,
      })
      .select("id,dish_name,confidence,summary,result,image_path,created_at")
      .single();

    if (saveError) {
      setSaveStatus(saveError.message);
    } else if (data) {
      const savedScan = {
        ...(data as SavedScan),
        result: ensureClientResult((data as SavedScan).result),
      };
      setSavedScans((current) => [
        savedScan,
        ...current.filter((scan) => scan.id !== savedScan.id),
      ].slice(0, 10));
      setSelectedSavedScanId(savedScan.id);
      setSaveStatus(
        uploadedImage.error
          ? "Saved recipe. Image storage needs the updated Supabase schema."
          : "Saved to your scan history.",
      );
      setMainView("history");
    }

    setIsSavingScan(false);
  }

  function openSavedScan(scan: SavedScan) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl(getSavedScanImageUrl(scan));
    const savedResult = ensureClientResult(scan.result);
    setResult(savedResult);
    setDishNameDraft(savedResult.dishName);
    setSelectedSavedScanId(scan.id);
    setSaveStatus("Loaded from your scan history.");
    setActionStatus("");
    setMainView("scan");
    setActiveTab("recipe");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function deleteSavedScan(scanId: string) {
    if (!supabase || !user) {
      return;
    }

    const scanToDelete = savedScans.find((scan) => scan.id === scanId);
    const { error: deleteError } = await supabase
      .from("snapchef_scans")
      .delete()
      .eq("id", scanId);

    if (deleteError) {
      setHistoryError(deleteError.message);
      return;
    }

    if (
      scanToDelete?.image_path &&
      !scanToDelete.image_path.startsWith("http") &&
      scanToDelete.image_path !== "local-preview"
    ) {
      await supabase.storage.from("snapchef-scans").remove([scanToDelete.image_path]);
    }

    setSavedScans((current) => current.filter((scan) => scan.id !== scanId));
    if (selectedSavedScanId === scanId) {
      setSelectedSavedScanId(null);
    }
  }

  function startDishNameEdit() {
    if (!result) {
      return;
    }

    setDishNameDraft(result.dishName);
    setIsEditingDishName(true);
  }

  function applyDishNameEdit() {
    const nextName = dishNameDraft.trim();

    if (!result || !nextName) {
      return;
    }

    setResult({
      ...result,
      dishName: nextName,
      recipe: {
        ...result.recipe,
        title: result.recipe.title.includes(result.dishName)
          ? result.recipe.title.replace(result.dishName, nextName)
          : result.recipe.title,
      },
      searchLinks: buildClientSearchLinks(nextName),
    });
    setSelectedSavedScanId(null);
    setSaveStatus("Dish name updated. Save again to keep this version.");
    setActionStatus("Updated detected dish name.");
    setIsEditingDishName(false);
  }

  async function copyShoppingList() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(formatShoppingList(result));
    setActionStatus("Shopping list copied.");
  }

  async function copyRecipe() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(formatRecipeForExport(result));
    setActionStatus("Recipe copied.");
  }

  function downloadRecipe() {
    if (!result) {
      return;
    }

    const fileName = `${slugify(result.dishName)}-snapchef-recipe.txt`;
    const blob = new Blob([formatRecipeForExport(result)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setActionStatus("Recipe download started.");
  }

  async function shareRecipe() {
    if (!result) {
      return;
    }

    const text = formatRecipeForExport(result);

    if (navigator.share) {
      await navigator.share({
        title: `${result.dishName} from SnapChef`,
        text,
      });
      setActionStatus("Share sheet opened.");
      return;
    }

    await navigator.clipboard.writeText(text);
    setActionStatus("Recipe copied for sharing.");
  }

  return (
    <main className={`${styles.shell} ${isScanActive ? styles.activeShell : ""}`}>
      <section className={styles.workspace}>
        <header className={styles.appHeader}>
          <div className={styles.logoLockup}>
            <span className={styles.logoMark}>SC</span>
            <span>SnapChef</span>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.statusBadge}>{confidenceText}</span>
            <button
              className={mainView === "history" ? styles.activeNavButton : styles.navButton}
              onClick={() => setMainView((view) => (view === "history" ? "scan" : "history"))}
              type="button"
            >
              My Scans
            </button>
            <button
              className={styles.accountButton}
              onClick={() => setIsAuthPanelOpen((isOpen) => !isOpen)}
              type="button"
            >
              {user ? `Hi ${displayName}` : "Sign in / Create account"}
            </button>
          </div>
        </header>

        {isAuthPanelOpen ? (
          <div className={styles.authPopover}>
            <AccountHistoryPanel
              authEmail={authEmail}
              authError={authError}
              authMessage={authMessage}
              authPassword={authPassword}
              historyError={historyError}
              isAuthBusy={isAuthBusy}
              isHistoryLoading={isHistoryLoading}
              isSupabaseReady={Boolean(supabase)}
              onAuthEmailChange={setAuthEmail}
              onAuthPasswordChange={setAuthPassword}
              onDeleteScan={deleteSavedScan}
              onOpenScan={openSavedScan}
              onSignIn={() => handleAuth("signIn")}
              onSignOut={signOut}
              onSignUp={() => handleAuth("signUp")}
              savedScans={savedScans}
              selectedSavedScanId={selectedSavedScanId}
              userEmail={user?.email ?? ""}
            />
          </div>
        ) : null}

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

        {isScanActive ? (
          <SidebarGuide
            activePreferenceSummary={activePreferenceSummary}
            isAnalyzing={isAnalyzing}
            result={result}
          />
        ) : null}
      </section>

      <section className={styles.resultPanel} aria-live="polite">
        <div className={styles.resultCanvas}>
          {mainView === "history" ? (
            <HistoryView
              historyError={historyError}
              isHistoryLoading={isHistoryLoading}
              isSupabaseReady={Boolean(supabase)}
              onDeleteScan={deleteSavedScan}
              onOpenScan={openSavedScan}
              onShowAuth={() => setIsAuthPanelOpen(true)}
              savedScans={savedScans}
              selectedSavedScanId={selectedSavedScanId}
              userEmail={user?.email ?? ""}
              getSavedScanImageUrl={getSavedScanImageUrl}
            />
          ) : result ? (
            <>
              <div
                className={styles.resultPhoto}
                role="img"
                aria-label={previewUrl ? "Uploaded food preview" : "Food spread"}
                style={{ backgroundImage: `url(${resultPhoto})` }}
              >
                <span>{result.exampleMode ? "Example result" : "Your scan"}</span>
              </div>

              <EditableDishHeader
                confidence={result.confidence}
                dishNameDraft={dishNameDraft}
                isEditing={isEditingDishName}
                onApply={applyDishNameEdit}
                onCancel={() => setIsEditingDishName(false)}
                onDraftChange={setDishNameDraft}
                onEdit={startDishNameEdit}
                result={result}
              />
              <p className={styles.summary}>{result.summary}</p>

              {result.notice ? <p className={styles.notice}>{result.notice}</p> : null}

              <ResultActionBar
                actionStatus={actionStatus}
                isSavingScan={isSavingScan}
                onCopyGroceryList={copyShoppingList}
                onCopyRecipe={copyRecipe}
                onDownloadRecipe={downloadRecipe}
                onSave={saveCurrentScan}
                onScanAnother={resetScan}
                onShareRecipe={shareRecipe}
                saveStatus={saveStatus}
                selectedSavedScanId={selectedSavedScanId}
                userEmail={user?.email ?? ""}
              />

              <AllergyWarning />

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
                <span>{result.nutritionEstimate.protein}</span>
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
                  className={activeTab === "nutrition" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("nutrition")}
                  type="button"
                >
                  Nutrition
                </button>
                <button
                  className={activeTab === "ideas" ? styles.activeTab : ""}
                  onClick={() => setActiveTab("ideas")}
                  type="button"
                >
                  Ideas
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
              {activeTab === "nutrition" ? <NutritionView result={result} /> : null}
              {activeTab === "ideas" ? <IdeasView result={result} /> : null}
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

              <div className={styles.starterIntro}>
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

              <div className={styles.starterActions}>
                <button className={styles.exampleButton} type="button" onClick={loadExample}>
                  See an example result
                </button>
              </div>

              <div className={styles.starterDetails}>
                <GuideGrid cards={starterDetailCards} />
              </div>

              <div className={styles.starterInfoGrid}>
                <section className={styles.aboutPanel}>
                  <div>
                    <p className={styles.eyebrow}>About</p>
                    <h3>Useful plans from food photos.</h3>
                    <p>
                      Built for students, leftovers, screenshots, busy nights, and quick meal
                      decisions.
                    </p>
                  </div>
                </section>

                <section className={styles.workflowPanel}>
                  <div>
                    <p className={styles.eyebrow}>How it works</p>
                    <h3>Picture, preferences, plan.</h3>
                  </div>
                  <div className={styles.workflowSteps}>
                    {starterWorkflowSteps.map((step) => (
                      <span key={step.label}>
                        <small>{step.label}</small>
                        <strong>{step.title}</strong>
                      </span>
                    ))}
                  </div>
                </section>

                <section className={styles.foodIdeaPanel}>
                  <div>
                    <p className={styles.eyebrow}>Food ideas</p>
                    <h3>Good first scans.</h3>
                  </div>
                  <div className={styles.tagCloud} aria-label="Food ideas">
                    {foodIdeaTags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </section>

                <section className={styles.contactPanel}>
                  <div>
                    <p className={styles.eyebrow}>Contact</p>
                    <h3>Feedback makes it better.</h3>
                  </div>
                  <div className={styles.contactLinks}>
                    <a href="mailto:fanyanwu@mcneese.edu">Email feedback</a>
                    <a
                      href="https://github.com/Fidel2197/snapchef"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      GitHub project
                    </a>
                  </div>
                </section>

                <section className={styles.savePanel}>
                  <div>
                    <p className={styles.eyebrow}>Save later</p>
                    <h3>Keep the good recipes close.</h3>
                    <p>Sign in to build a small history of meals, grocery lists, and favorite scans.</p>
                  </div>
                  <div className={styles.featurePillGrid} aria-label="Saved recipe benefits">
                    <span>Saved scans</span>
                    <span>Recipe history</span>
                    <span>Grocery lists</span>
                  </div>
                </section>

                <section className={styles.photoFinishPanel}>
                  <div>
                    <p className={styles.eyebrow}>Next plate</p>
                    <h3>Dorm bowls, leftovers, and quick dinners.</h3>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function EditableDishHeader({
  confidence,
  dishNameDraft,
  isEditing,
  onApply,
  onCancel,
  onDraftChange,
  onEdit,
  result,
}: {
  confidence: Confidence;
  dishNameDraft: string;
  isEditing: boolean;
  onApply: () => void;
  onCancel: () => void;
  onDraftChange: (value: string) => void;
  onEdit: () => void;
  result: SnapChefResult;
}) {
  return (
    <div className={styles.resultHeader}>
      <div className={styles.editableDishHeader}>
        <p className={styles.eyebrow}>Detected dish</p>
        {isEditing ? (
          <div className={styles.editDishForm}>
            <input
              aria-label="Detected dish name"
              onChange={(event) => onDraftChange(event.target.value)}
              value={dishNameDraft}
            />
            <button onClick={onApply} type="button">
              Apply
            </button>
            <button onClick={onCancel} type="button">
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h2>{result.dishName}</h2>
            <button className={styles.inlineEditButton} onClick={onEdit} type="button">
              Wrong dish? Edit name
            </button>
          </>
        )}
      </div>
      <span className={styles.confidencePill}>{confidence}</span>
    </div>
  );
}

function ResultActionBar({
  actionStatus,
  isSavingScan,
  onCopyGroceryList,
  onCopyRecipe,
  onDownloadRecipe,
  onSave,
  onScanAnother,
  onShareRecipe,
  saveStatus,
  selectedSavedScanId,
  userEmail,
}: {
  actionStatus: string;
  isSavingScan: boolean;
  onCopyGroceryList: () => void;
  onCopyRecipe: () => void;
  onDownloadRecipe: () => void;
  onSave: () => void;
  onScanAnother: () => void;
  onShareRecipe: () => void;
  saveStatus: string;
  selectedSavedScanId: string | null;
  userEmail: string;
}) {
  return (
    <div className={styles.resultActionBar}>
      <div className={styles.resultActionSummary}>
        <span>Recipe actions</span>
        <strong>
          {selectedSavedScanId ? "Saved recipe" : userEmail ? "Ready to save" : "Sign in to save"}
        </strong>
        {saveStatus || actionStatus ? <small>{saveStatus || actionStatus}</small> : null}
      </div>
      <div className={styles.resultActions}>
        <button disabled={isSavingScan || !userEmail} onClick={onSave} type="button">
          {isSavingScan ? "Saving..." : "Save Recipe"}
        </button>
        <button onClick={onScanAnother} type="button">
          Scan Another Photo
        </button>
        <button onClick={onCopyGroceryList} type="button">
          Copy Grocery List
        </button>
        <button onClick={onCopyRecipe} type="button">
          Copy Recipe
        </button>
        <button onClick={onDownloadRecipe} type="button">
          Download
        </button>
        <button onClick={onShareRecipe} type="button">
          Share
        </button>
      </div>
    </div>
  );
}

function AllergyWarning() {
  return (
    <div className={styles.allergyWarning}>
      <span>Allergy Check</span>
      <strong>
        SnapChef may not detect hidden ingredients. Always check labels and ask about dairy, nuts,
        gluten, shellfish, and other allergens before eating.
      </strong>
    </div>
  );
}

function HistoryView({
  getSavedScanImageUrl,
  historyError,
  isHistoryLoading,
  isSupabaseReady,
  onDeleteScan,
  onOpenScan,
  onShowAuth,
  savedScans,
  selectedSavedScanId,
  userEmail,
}: {
  getSavedScanImageUrl: (scan: SavedScan) => string;
  historyError: string;
  isHistoryLoading: boolean;
  isSupabaseReady: boolean;
  onDeleteScan: (scanId: string) => void;
  onOpenScan: (scan: SavedScan) => void;
  onShowAuth: () => void;
  savedScans: SavedScan[];
  selectedSavedScanId: string | null;
  userEmail: string;
}) {
  return (
    <section className={styles.historyView}>
      <div className={styles.historyHero}>
        <p className={styles.eyebrow}>My Scans</p>
        <h2>Saved recipes and scan history.</h2>
        <p>
          Reopen previous results, reuse grocery lists, and keep the recipes that worked for you.
        </p>
      </div>

      {!isSupabaseReady ? (
        <p className={styles.notice}>Add Supabase environment variables, then restart the app.</p>
      ) : null}

      {!userEmail ? (
        <div className={styles.emptyHistoryState}>
          <strong>Sign in to build your recipe history.</strong>
          <button onClick={onShowAuth} type="button">
            Sign in / Create account
          </button>
        </div>
      ) : null}

      {userEmail && isHistoryLoading ? <p className={styles.priceNote}>Loading saved scans...</p> : null}
      {historyError ? <p className={styles.errorText}>{historyError}</p> : null}

      {userEmail && savedScans.length ? (
        <div className={styles.historyGrid}>
          {savedScans.map((scan) => {
            const imageUrl = getSavedScanImageUrl(scan);

            return (
              <article
                className={scan.id === selectedSavedScanId ? styles.activeHistoryCard : ""}
                key={scan.id}
              >
                <button className={styles.historyCardMain} onClick={() => onOpenScan(scan)} type="button">
                  <span
                    className={styles.savedScanThumb}
                    style={{
                      backgroundImage: imageUrl ? `url(${imageUrl})` : "url(/snapchef-food-board.png)",
                    }}
                    aria-hidden="true"
                  />
                  <span className={styles.historyCardText}>
                    <small>{new Date(scan.created_at).toLocaleString()}</small>
                    <strong>{scan.dish_name}</strong>
                    <em>
                      {scan.result.recipe.time} - {scan.result.shoppingPlan.estimatedPerServing}
                    </em>
                    {scan.result.appliedPreferences?.length ? (
                      <span>{scan.result.appliedPreferences.slice(0, 3).join(", ")}</span>
                    ) : null}
                  </span>
                </button>
                <button className={styles.deleteScanButton} onClick={() => onDeleteScan(scan.id)} type="button">
                  Delete
                </button>
              </article>
            );
          })}
        </div>
      ) : null}

      {userEmail && !isHistoryLoading && !savedScans.length ? (
        <div className={styles.emptyHistoryState}>
          <strong>No saved scans yet.</strong>
          <span>Analyze a food image, then hit Save Recipe.</span>
        </div>
      ) : null}
    </section>
  );
}

function AccountHistoryPanel({
  authEmail,
  authError,
  authMessage,
  authPassword,
  historyError,
  isAuthBusy,
  isHistoryLoading,
  isSupabaseReady,
  onAuthEmailChange,
  onAuthPasswordChange,
  onDeleteScan,
  onOpenScan,
  onSignIn,
  onSignOut,
  onSignUp,
  savedScans,
  selectedSavedScanId,
  userEmail,
}: {
  authEmail: string;
  authError: string;
  authMessage: string;
  authPassword: string;
  historyError: string;
  isAuthBusy: boolean;
  isHistoryLoading: boolean;
  isSupabaseReady: boolean;
  onAuthEmailChange: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
  onDeleteScan: (scanId: string) => void;
  onOpenScan: (scan: SavedScan) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onSignUp: () => void;
  savedScans: SavedScan[];
  selectedSavedScanId: string | null;
  userEmail: string;
}) {
  return (
    <section className={styles.accountPanel}>
      <div className={styles.accountHeader}>
        <div>
          <p className={styles.eyebrow}>Account</p>
          <h2>{userEmail ? "Your scan history" : "Sign in to save scans"}</h2>
        </div>
        {userEmail ? (
          <button className={styles.clearPresetButton} onClick={onSignOut} type="button">
            Sign out
          </button>
        ) : null}
      </div>

      {!isSupabaseReady ? (
        <p className={styles.authNotice}>
          Add Supabase keys to .env.local and restart the app to enable history.
        </p>
      ) : null}

      {userEmail ? (
        <>
          <p className={styles.authNotice}>Signed in as {userEmail}</p>
          {isHistoryLoading ? <p className={styles.authNotice}>Loading saved scans...</p> : null}
          {historyError ? <p className={styles.errorText}>{historyError}</p> : null}
          {savedScans.length ? (
            <div className={styles.savedScanList}>
              {savedScans.map((scan) => (
                <article
                  className={scan.id === selectedSavedScanId ? styles.activeSavedScan : ""}
                  key={scan.id}
                >
                  <button onClick={() => onOpenScan(scan)} type="button">
                    <span>{scan.confidence} confidence</span>
                    <strong>{scan.dish_name}</strong>
                    <small>{new Date(scan.created_at).toLocaleString()}</small>
                  </button>
                  <button
                    aria-label={`Delete ${scan.dish_name}`}
                    className={styles.deleteScanButton}
                    onClick={() => onDeleteScan(scan.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.authNotice}>No saved scans yet. Analyze an image, then save it.</p>
          )}
        </>
      ) : (
        <div className={styles.authForm}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              autoComplete="email"
              disabled={!isSupabaseReady || isAuthBusy}
              onChange={(event) => onAuthEmailChange(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={authEmail}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              autoComplete="current-password"
              disabled={!isSupabaseReady || isAuthBusy}
              onChange={(event) => onAuthPasswordChange(event.target.value)}
              placeholder="At least 6 characters"
              type="password"
              value={authPassword}
            />
          </label>
          <div className={styles.authActions}>
            <button disabled={!isSupabaseReady || isAuthBusy} onClick={onSignIn} type="button">
              Sign in
            </button>
            <button disabled={!isSupabaseReady || isAuthBusy} onClick={onSignUp} type="button">
              Create account
            </button>
          </div>
          {authError ? <p className={styles.errorText}>{authError}</p> : null}
          {authMessage ? <p className={styles.authNotice}>{authMessage}</p> : null}
        </div>
      )}
    </section>
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
  const currentGuide = confidenceGuide.find((item) => item.level === confidence) ?? confidenceGuide[1];

  return (
    <details className={styles.confidenceGuide}>
      <summary>
        <span>{currentGuide.label} confidence</span>
        <strong>{currentGuide.detail}</strong>
      </summary>
      <div className={styles.confidenceLevels}>
        {confidenceGuide.map((item) => (
          <span className={item.level === confidence ? styles.activeConfidence : ""} key={item.level}>
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
          </span>
        ))}
      </div>
    </details>
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
      <AllergyWarning />
      <InfoList title="Substitutions" items={result.substitutions} />
      <InfoList title="Nutrition notes" items={result.nutritionNotes} />
      <InfoList title="Safety notes" items={result.safetyNotes} />
    </div>
  );
}

function ShoppingView({ result }: { result: SnapChefResult }) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState("");

  function toggleItem(name: string) {
    setCheckedItems((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  }

  async function copyList() {
    await navigator.clipboard.writeText(formatShoppingList(result));
    setCopyStatus("Shopping list copied.");
  }

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
      <div className={styles.shoppingToolbar}>
        <span>{checkedItems.length} of {result.shoppingPlan.items.length} checked</span>
        <button onClick={copyList} type="button">
          Copy shopping list
        </button>
      </div>
      {copyStatus ? <p className={styles.copyStatus}>{copyStatus}</p> : null}

      <ul className={styles.shoppingGrid}>
        {result.shoppingPlan.items.map((item) => (
          <li key={`${item.name}-${item.amount ?? ""}`}>
            <label className={styles.checklistHeader}>
              <input
                checked={checkedItems.includes(item.name)}
                onChange={() => toggleItem(item.name)}
                type="checkbox"
              />
              <span>
                <strong>{item.name}</strong>
                <em>{item.amount || "as needed"}</em>
              </span>
            </label>
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

function NutritionView({ result }: { result: SnapChefResult }) {
  const estimate = result.nutritionEstimate;

  return (
    <div className={styles.nutritionView}>
      <div className={styles.nutritionGrid}>
        <span>
          <small>Calories</small>
          <strong>{estimate.calories}</strong>
        </span>
        <span>
          <small>Protein</small>
          <strong>{estimate.protein}</strong>
        </span>
        <span>
          <small>Carbs</small>
          <strong>{estimate.carbs}</strong>
        </span>
        <span>
          <small>Fat</small>
          <strong>{estimate.fat}</strong>
        </span>
      </div>
      <p className={styles.priceNote}>{estimate.note}</p>
      <AllergyWarning />
      <InfoList title="Nutrition notes" items={result.nutritionNotes} />
    </div>
  );
}

function IdeasView({ result }: { result: SnapChefResult }) {
  return (
    <div className={styles.ideasView}>
      <div className={styles.variantGrid}>
        {result.recipeVariants.map((variant) => (
          <article key={variant.title}>
            <span>{variant.title}</span>
            <strong>{variant.description}</strong>
            <p>{variant.adjustment}</p>
          </article>
        ))}
      </div>
      <InfoList title="Substitutions" items={result.substitutions} />
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

function buildClientSearchLinks(dishName: string): SearchLink[] {
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

function formatShoppingList(result: SnapChefResult) {
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

function formatRecipeForExport(result: SnapChefResult) {
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

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "recipe"
  );
}

function ensureClientResult(result: SnapChefResult): SnapChefResult {
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

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "string"
  );
}
