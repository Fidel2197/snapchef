import { afterEach, describe, expect, it, vi } from "vitest";
import { imageValidationError, MAX_IMAGE_BYTES, requestAnalysis } from "./analyze-image";
import { exampleResult } from "./snapchef-content";

const options = { servings: "2", preferences: "vegetarian", groceryLocation: "Chicago" };
const image = () => new File(["image"], "plate.png", { type: "image/png" });
afterEach(() => vi.unstubAllGlobals());

describe("image validation", () => {
  it.each(["text/plain", "image/svg+xml", "image/gif"])("rejects unsupported %s before calling the API", async (type) => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    await expect(requestAnalysis(new File(["data"], "file", { type }), options)).rejects.toThrow("JPG, PNG, or WebP");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects empty and oversized files, and permits the advertised boundary", () => {
    expect(imageValidationError({ type: "image/png", size: 0 })).toContain("empty");
    expect(imageValidationError({ type: "image/png", size: MAX_IMAGE_BYTES + 1 })).toContain("3 MB");
    expect(imageValidationError({ type: "image/jpeg", size: MAX_IMAGE_BYTES })).toBe("");
  });
});

describe("analysis requests", () => {
  it("sends the image and preferences and returns a usable recipe", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(exampleResult)); vi.stubGlobal("fetch", fetch);
    expect((await requestAnalysis(image(), options)).dishName).toBe(exampleResult.dishName);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/analyze"); expect(init.method).toBe("POST");
    expect(init.body.get("image").name).toBe("plate.png");
    expect(init.body.get("preferences")).toBe("vegetarian");
    expect(init.body.get("groceryLocation")).toBe("Chicago");
  });
  it("surfaces a provider error without turning it into an example success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Daily quota reached" }, { status: 429 })));
    await expect(requestAnalysis(image(), options)).rejects.toThrow("Daily quota reached");
  });
  it("explains network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(requestAnalysis(image(), options)).rejects.toThrow("Check your connection");
  });
  it("handles a non-JSON hosting error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Gateway timeout", { status: 504 })));
    await expect(requestAnalysis(image(), options)).rejects.toThrow("unreadable response");
  });
  it("rejects incomplete success payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ dishName: "Pasta" })));
    await expect(requestAnalysis(image(), options)).rejects.toThrow("incomplete recipe");
  });
});
