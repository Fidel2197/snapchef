import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { insertScan, listScans, removeScan, scanImageUrl } from "@/lib/scan-history";
import type { SavedScan, SnapChefResult } from "@/lib/snapchef-types";

const message = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";

export function useAccountHistory() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [savedScans, setSavedScans] = useState<SavedScan[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [isSavingScan, setIsSavingScan] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const requestId = useRef(0);
  const activeUserId = useRef<string | null>(null);
  const user = session?.user ?? null;

  const loadSavedScans = useCallback(async (next: Session | null) => {
    const id = ++requestId.current;
    activeUserId.current = next?.user.id ?? null;
    setSession(next);
    setSavedScans([]);
    setHistoryError("");
    setSaveStatus("");
    if (!supabase || !next?.user) { setIsHistoryLoading(false); return; }
    setIsHistoryLoading(true);
    try {
      const scans = await listScans(supabase, next.user.id);
      if (requestId.current === id) setSavedScans(scans);
    } catch (error) {
      if (requestId.current === id) setHistoryError(message(error));
    } finally {
      if (requestId.current === id) setIsHistoryLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    let authChanged = false;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted || authChanged) return;
      if (error) setAuthError(error.message);
      else void loadSavedScans(data.session);
    }).catch((error) => { if (mounted) setAuthError(message(error)); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      authChanged = true;
      // Defer client queries until Supabase finishes its auth event callback.
      queueMicrotask(() => { if (mounted) void loadSavedScans(next); });
    });
    const pendingRequests = requestId;
    return () => { mounted = false; pendingRequests.current++; activeUserId.current = null; subscription.unsubscribe(); };
  }, [loadSavedScans, supabase]);

  async function handleAuth(mode: "signIn" | "signUp") {
    if (!supabase) { setAuthError("Accounts are temporarily unavailable. Please try again later."); return; }
    const email = authEmail.trim();
    if (!email || authPassword.length < 6) { setAuthError("Use an email and a password with at least 6 characters."); return; }
    setIsAuthBusy(true); setAuthError(""); setAuthMessage("");
    try {
      const credentials = { email, password: authPassword };
      const { data, error } = mode === "signUp"
        ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: `${window.location.origin}/` } })
        : await supabase.auth.signInWithPassword(credentials);
      if (error) throw new Error(error.message);
      if (mode === "signUp" && !data.session) setAuthMessage("Account created. Check your email to confirm your account.");
      else { setAuthMessage(mode === "signUp" ? "Account created and signed in." : "Signed in."); setAuthPassword(""); }
    } catch (error) { setAuthError(message(error)); }
    finally { setIsAuthBusy(false); }
  }

  async function signOut() {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      await loadSavedScans(null);
      setAuthMessage("Signed out.");
    } catch (error) { setAuthError(message(error)); }
  }

  async function saveScan(result: SnapChefResult | null, file: File | null) {
    if (!supabase || !user || !result) { setSaveStatus("Sign in first, then save this scan."); return null; }
    const owner = user.id;
    setIsSavingScan(true); setSaveStatus("");
    try {
      const { scan, imageWarning } = await insertScan(supabase, owner, result, file);
      if (activeUserId.current !== owner) return null;
      setSavedScans((current) => [scan, ...current.filter((item) => item.id !== scan.id)].slice(0, 10));
      setSaveStatus(imageWarning ? "Saved recipe, but its photo could not be uploaded." : "Saved to your scan history.");
      return scan;
    } catch (error) { if (activeUserId.current === owner) setSaveStatus(message(error)); return null; }
    finally { setIsSavingScan(false); }
  }

  async function deleteScan(scanId: string) {
    const scan = savedScans.find((item) => item.id === scanId);
    if (!supabase || !user || !scan) return false;
    const owner = user.id;
    try {
      const warning = await removeScan(supabase, owner, scan);
      if (activeUserId.current !== owner) return false;
      setHistoryError(warning);
      setSavedScans((current) => current.filter((item) => item.id !== scanId));
      return true;
    } catch (error) { if (activeUserId.current === owner) setHistoryError(message(error)); return false; }
  }

  return { supabase, user, authEmail, setAuthEmail, authPassword, setAuthPassword,
    authMessage, authError, isAuthBusy, savedScans, isHistoryLoading, historyError,
    isSavingScan, saveStatus, setSaveStatus, handleAuth, signOut, saveScan, deleteScan,
    getSavedScanImageUrl: (scan: SavedScan) => scanImageUrl(supabase, scan) };
}
