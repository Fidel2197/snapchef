import type { ChangeEvent, DragEvent, FormEvent, RefObject } from "react";
import { preferencePresets } from "@/lib/snapchef-content";
import styles from "../snapchef-app.module.css";

type Props = {
  isScanActive: boolean; previewUrl: string; isAnalyzing: boolean; error: string;
  servings: string; groceryLocation: string; customPreferences: string;
  selectedPresets: string[]; activePreferenceSummary: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  analyzeImage: (event: FormEvent<HTMLFormElement>) => void;
  handleDrop: (event: DragEvent<HTMLLabelElement>) => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  setServings: (value: string) => void; setGroceryLocation: (value: string) => void;
  setCustomPreferences: (value: string) => void; setSelectedPresets: (value: string[]) => void;
  togglePreset: (value: string) => void; loadExample: () => void; resetScan: () => void;
};
export function UploadPanel({ isScanActive, previewUrl, isAnalyzing, error, servings,
  groceryLocation, customPreferences, selectedPresets, activePreferenceSummary,
  fileInputRef, analyzeImage, handleDrop, handleFileChange, setServings, setGroceryLocation,
  setCustomPreferences, setSelectedPresets, togglePreset, loadExample, resetScan }: Props) {
  return (
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
                <span className={styles.dropzoneMeta}>JPG, PNG, or WebP under 3 MB</span>
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Food image"
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
              <span>Find the prices based on where you live</span>
              <input
                autoComplete="postal-code"
                inputMode="text"
                maxLength={80}
                value={groceryLocation}
                onChange={(event) => setGroceryLocation(event.target.value)}
                placeholder="ZIP, city, campus, or country"
              />
              <small>This is used for rough regional prices and store suggestions.</small>
            </label>
            <label className={styles.field}>
              <span>Any extra notes</span>
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

          {error ? <p className={styles.errorText} role="alert">{error}</p> : null}
        </form>

  );
}
