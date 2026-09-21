import { useState } from "react";
import type { Confidence, SnapChefResult } from "@/lib/snapchef-types";
import { confidenceGuide } from "@/lib/snapchef-content";
import { formatShoppingList } from "@/lib/recipe-result";
import styles from "../snapchef-app.module.css";

export function EditableDishHeader({
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

export function ResultActionBar({
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

export function AllergyWarning() {
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

export function RecipeView({ result }: { result: SnapChefResult }) {
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

export function ConfidenceGuide({ confidence }: { confidence: Confidence }) {
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

export function IngredientsView({ result }: { result: SnapChefResult }) {
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

export function ShoppingView({ result }: { result: SnapChefResult }) {
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

export function NutritionView({ result }: { result: SnapChefResult }) {
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

export function IdeasView({ result }: { result: SnapChefResult }) {
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

export function VideosView({ result }: { result: SnapChefResult }) {
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

export function InfoList({ title, items }: { title: string; items: string[] }) {
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
