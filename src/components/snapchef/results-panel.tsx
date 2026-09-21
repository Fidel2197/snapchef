import type { ResultTab, SnapChefResult } from "@/lib/snapchef-types";
import { EditableDishHeader, ResultActionBar, AllergyWarning, ConfidenceGuide, RecipeView, IngredientsView, ShoppingView, NutritionView, IdeasView, VideosView } from "./result-views";
import styles from "../snapchef-app.module.css";

type Props = {
  result: SnapChefResult; previewUrl: string; resultPhoto: string; dishNameDraft: string;
  isEditingDishName: boolean; actionStatus: string; isSavingScan: boolean; saveStatus: string;
  selectedSavedScanId: string | null; userEmail: string; activeTab: ResultTab;
  setActiveTab: (value: ResultTab) => void; setIsEditingDishName: (value: boolean) => void;
  setDishNameDraft: (value: string) => void; applyDishNameEdit: () => void;
  startDishNameEdit: () => void; copyShoppingList: () => void; copyRecipe: () => void;
  downloadRecipe: () => void; saveCurrentScan: () => void; resetScan: () => void;
  shareRecipe: () => void;
};
export function ResultsPanel({ result, previewUrl, resultPhoto, dishNameDraft,
  isEditingDishName, actionStatus, isSavingScan, saveStatus, selectedSavedScanId,
  userEmail, activeTab, setActiveTab, setIsEditingDishName, setDishNameDraft,
  applyDishNameEdit, startDishNameEdit, copyShoppingList, copyRecipe, downloadRecipe,
  saveCurrentScan, resetScan, shareRecipe }: Props) {
  return (
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
                userEmail={userEmail}
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
  );
}
