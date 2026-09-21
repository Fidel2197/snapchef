// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import SnapChefApp from "./snapchef-app";
import { exampleResult } from "@/lib/snapchef-content";

vi.mock("./snapchef/use-account-history", () => ({
  useAccountHistory: () => ({
    supabase: null, user: null, authEmail: "", setAuthEmail: vi.fn(), authPassword: "", setAuthPassword: vi.fn(),
    authMessage: "", authError: "", isAuthBusy: false, savedScans: [], isHistoryLoading: false,
    historyError: "", isSavingScan: false, saveStatus: "", setSaveStatus: vi.fn(), handleAuth: vi.fn(),
    signOut: vi.fn(), saveScan: vi.fn(), deleteScan: vi.fn(), getSavedScanImageUrl: vi.fn(),
  }),
}));

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:test-image") });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("the scan flow", () => {
  it("explains an invalid upload without sending it to the server", () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    render(<SnapChefApp />);
    fireEvent.change(screen.getByLabelText("Food image"), { target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] } });
    expect(screen.getByRole("alert")).toHaveTextContent("JPG, PNG, or WebP");
    expect(fetch).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("shows an API failure and allows the user to retry successfully", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Quota reached. Try again later." }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...exampleResult, exampleMode: false }) });
    vi.stubGlobal("fetch", fetch);
    render(<SnapChefApp />);
    fireEvent.change(screen.getByLabelText("Food image"), { target: { files: [new File(["image"], "plate.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("button", { name: "Analyze image" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Quota reached");
    expect(screen.getByRole("button", { name: "Analyze image" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Analyze image" }));
    expect(await screen.findByText("Your scan")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("clearly labels a fixed example and keeps account saving disabled when signed out", () => {
    render(<SnapChefApp />);
    fireEvent.click(screen.getByRole("button", { name: "See example" }));
    expect(screen.getByText("Example result")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Recipe" })).toBeDisabled();
  });

  it("ignores a late analysis response after the user resets the scan", async () => {
    let resolve!: (response: unknown) => void;
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise((done) => { resolve = done; })));
    render(<SnapChefApp />);
    fireEvent.change(screen.getByLabelText("Food image"), { target: { files: [new File(["image"], "plate.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("button", { name: "Analyze image" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await act(async () => resolve({ ok: true, json: async () => ({ ...exampleResult, exampleMode: false }) }));
    expect(screen.queryByText("Your scan")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ready when your plate is." })).toBeInTheDocument();
  });
});
