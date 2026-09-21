"use client";
import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAccountHistory } from "./snapchef/use-account-history";
import type { MainView, ResultTab, SavedScan, SnapChefResult } from "@/lib/snapchef-types";
import { preferencePresets, storyCards, exampleResult } from "@/lib/snapchef-content";
import { ensureClientResult, buildClientSearchLinks, formatShoppingList, formatRecipeForExport, slugify } from "@/lib/recipe-result";
import { imageValidationError, requestAnalysis } from "@/lib/analyze-image";
import { AccountHistoryPanel } from "./snapchef/account-panel";
import { HistoryView } from "./snapchef/history-view";
import { ScanProgress, ScanSummary, SidebarGuide } from "./snapchef/scan-guide";
import { UploadPanel } from "./snapchef/upload-panel";
import { StarterView } from "./snapchef/starter-view";
import { ResultsPanel } from "./snapchef/results-panel";
import styles from "./snapchef-app.module.css";

export default function SnapChefApp() {
  const { supabase, user, authEmail, setAuthEmail, authPassword, setAuthPassword,
    authMessage, authError, isAuthBusy, savedScans, isHistoryLoading, historyError,
    isSavingScan, saveStatus, setSaveStatus, handleAuth, signOut, saveScan, deleteScan,
    getSavedScanImageUrl } = useAccountHistory();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customPreferences, setCustomPreferences] = useState("");
  const [groceryLocation, setGroceryLocation] = useState("");
  const [servings, setServings] = useState("2");
  const [result, setResult] = useState<SnapChefResult | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("recipe");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSavedScanId, setSelectedSavedScanId] = useState<string | null>(null);
  const [mainView, setMainView] = useState<MainView>("scan");
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);
  const [isEditingDishName, setIsEditingDishName] = useState(false);
  const [dishNameDraft, setDishNameDraft] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultPanelRef = useRef<HTMLElement>(null);
  const analysisRequestId = useRef(0);
  const isGroceryLocationReadyRef = useRef(false);
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

  useEffect(() => {
    window.setTimeout(() => {
      const savedLocation = window.localStorage.getItem("snapchef:grocery-location");
      isGroceryLocationReadyRef.current = true;

      if (savedLocation) {
        setGroceryLocation(savedLocation);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!isGroceryLocationReadyRef.current) {
      return;
    }

    const nextLocation = groceryLocation.trim();

    if (nextLocation) {
      window.localStorage.setItem("snapchef:grocery-location", nextLocation);
    } else {
      window.localStorage.removeItem("snapchef:grocery-location");
    }
  }, [groceryLocation]);

  function togglePreset(value: string) {
    setSelectedPresets((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function chooseFile(selectedFile?: File) {
    if (!selectedFile) {
      return;
    }

    const validation = imageValidationError(selectedFile);
    if (validation) {
      setError(validation);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    analysisRequestId.current++;
    setIsAnalyzing(false);
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

    const requestId = ++analysisRequestId.current;
    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const nextResult = await requestAnalysis(file, { preferences, servings, groceryLocation });
      if (requestId !== analysisRequestId.current) return;
      setResult(nextResult);
      setDishNameDraft(nextResult.dishName);
      setSelectedSavedScanId(null);
      setSaveStatus("");
      setActionStatus("");
      setMainView("scan");
      setActiveTab("recipe");
    } catch (caughtError) {
      if (requestId === analysisRequestId.current) {
        setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
      }
    } finally {
      if (requestId === analysisRequestId.current) setIsAnalyzing(false);
    }
  }

  function loadExample() {
    analysisRequestId.current++;
    setIsAnalyzing(false);
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
    analysisRequestId.current++;
    setIsAnalyzing(false);
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

  async function saveCurrentScan() {
    const scan = await saveScan(result, file);
    if (scan) {
      setSelectedSavedScanId(scan.id);
      setMainView("history");
      window.setTimeout(scrollToResults, 80);
    }
  }

  function openSavedScan(scan: SavedScan) {
    analysisRequestId.current++;
    setIsAnalyzing(false);
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
    if (await deleteScan(scanId) && selectedSavedScanId === scanId) setSelectedSavedScanId(null);
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

  function scrollToResults() {
    resultPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleHistoryView() {
    const nextView = mainView === "history" ? "scan" : "history";
    setMainView(nextView);

    if (nextView === "history") {
      window.setTimeout(scrollToResults, 80);
    }
  }

  return (
    <main className={`${styles.shell} ${isScanActive ? styles.activeShell : ""}`}>
      <section className={styles.workspace}>
        <header className={styles.appHeader}>
          <div className={styles.logoLockup}>
            <span className={styles.logoMark} aria-hidden="true" />
            <span>SnapChef</span>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.statusBadge}>{confidenceText}</span>
            <button
              className={mainView === "history" ? styles.activeNavButton : styles.navButton}
              onClick={toggleHistoryView}
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

        {mainView === "history" ? (
          <button className={styles.scrollHint} onClick={scrollToResults} type="button">
            <span>My Scans is below</span>
            <strong>Scroll down to see saved scans</strong>
          </button>
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
              <p className={styles.eyebrow}>The Food photo to recipe app</p>
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

        <UploadPanel {...{ isScanActive, previewUrl, isAnalyzing, error, servings,
          groceryLocation, customPreferences, selectedPresets, activePreferenceSummary,
          fileInputRef, analyzeImage, handleDrop, handleFileChange, setServings, setGroceryLocation,
          setCustomPreferences, setSelectedPresets, togglePreset, loadExample, resetScan }} />

        {isScanActive ? (
          <SidebarGuide
            activePreferenceSummary={activePreferenceSummary}
            isAnalyzing={isAnalyzing}
            result={result}
          />
        ) : null}
      </section>

      <section className={styles.resultPanel} aria-live="polite" ref={resultPanelRef}>
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
            <ResultsPanel {...{ result, previewUrl, resultPhoto, dishNameDraft,
              isEditingDishName, actionStatus, isSavingScan, saveStatus, selectedSavedScanId,
              activeTab, setActiveTab, setIsEditingDishName, setDishNameDraft,
              applyDishNameEdit, startDishNameEdit, copyShoppingList, copyRecipe, downloadRecipe,
              saveCurrentScan, resetScan, shareRecipe }} userEmail={user?.email ?? ""} />
          ) : (
            <StarterView loadExample={loadExample} />
          )}
        </div>
      </section>
    </main>
  );
}
