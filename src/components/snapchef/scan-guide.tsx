import type { SnapChefResult } from "@/lib/snapchef-types";
import { prepGuideCards, scanGuideCards } from "@/lib/snapchef-content";
import styles from "../snapchef-app.module.css";

export function ScanProgress({
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

export function ScanSummary({
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

export function SidebarGuide({
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

export function GuideGrid({ cards }: { cards: { label: string; value: string }[] }) {
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
