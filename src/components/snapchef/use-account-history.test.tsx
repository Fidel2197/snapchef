// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { useAccountHistory } from "./use-account-history";
import { exampleResult } from "@/lib/snapchef-content";
import type { SavedScan } from "@/lib/snapchef-types";

const mocks = vi.hoisted(() => ({
  list: vi.fn(), getSession: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn(),
}));
vi.mock("@/lib/scan-history", () => ({ listScans: mocks.list, insertScan: vi.fn(), removeScan: vi.fn(), scanImageUrl: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ getSupabaseBrowserClient: () => client }));
const client = { auth: { getSession: mocks.getSession, onAuthStateChange: mocks.subscribe } };
const session = (id: string) => ({ user: { id, email: `${id}@example.com` } }) as Session;
const scan: SavedScan = { id: "scan-a", dish_name: "Saved pasta", confidence: "medium", summary: "Pasta", result: exampleResult, image_path: null, created_at: "2026-09-20T00:00:00Z" };
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("does not expose the previous user's delayed history after signing out", async () => {
  let resolveScans!: (scans: SavedScan[]) => void;
  let notify!: (event: string, session: Session | null) => void;
  mocks.getSession.mockResolvedValue({ data: { session: session("user-a") }, error: null });
  mocks.list.mockReturnValue(new Promise((resolve) => { resolveScans = resolve; }));
  mocks.subscribe.mockImplementation((callback) => { notify = callback; return { data: { subscription: { unsubscribe: mocks.unsubscribe } } }; });
  const { result } = renderHook(() => useAccountHistory());
  await waitFor(() => expect(mocks.list).toHaveBeenCalledWith(client, "user-a"));
  await act(async () => notify("SIGNED_OUT", null));
  await act(async () => resolveScans([scan]));
  expect(result.current.user).toBeNull();
  expect(result.current.savedScans).toEqual([]);
  expect(result.current.isHistoryLoading).toBe(false);
});

it("reloads stored recipes for an authenticated session", async () => {
  mocks.getSession.mockResolvedValue({ data: { session: session("user-a") }, error: null });
  mocks.list.mockResolvedValue([scan]);
  mocks.subscribe.mockReturnValue({ data: { subscription: { unsubscribe: mocks.unsubscribe } } });
  const { result } = renderHook(() => useAccountHistory());
  await waitFor(() => expect(result.current.savedScans).toEqual([scan]));
  expect(result.current.user?.id).toBe("user-a");
  expect(result.current.historyError).toBe("");
});
