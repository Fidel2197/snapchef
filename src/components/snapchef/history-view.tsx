import type { SavedScan } from "@/lib/snapchef-types";
import styles from "../snapchef-app.module.css";

export function HistoryView({
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
        <p className={styles.notice}>Saved recipes are temporarily unavailable. Please try again later.</p>
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
