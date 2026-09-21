import type { SavedScan } from "@/lib/snapchef-types";
import styles from "../snapchef-app.module.css";

export function AccountHistoryPanel({
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
          Accounts are temporarily unavailable. Please try again later.
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
