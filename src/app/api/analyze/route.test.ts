import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { MAX_IMAGE_BYTES } from "@/lib/analyze-image";

function request(file?: File) {
  const form = new FormData(); if (file) form.set("image", file);
  return new Request("http://localhost/api/analyze", { method: "POST", body: form });
}
const image = () => new File(["image"], "plate.png", { type: "image/png" });
beforeEach(() => { vi.stubEnv("GEMINI_API_KEY", ""); vi.stubEnv("OPENAI_API_KEY", ""); vi.stubEnv("AI_PROVIDER", "gemini"); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("POST /api/analyze", () => {
  it("rejects a malformed form with a JSON 400 response", async () => {
    const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: "invalid" }));
    expect(response.status).toBe(400); expect((await response.json()).error).toContain("multipart");
  });
  it("requires an image", async () => { expect((await POST(request())).status).toBe(400); });
  it.each([
    new File(["text"], "notes.txt", { type: "text/plain" }),
    new File(["<svg/>"], "image.svg", { type: "image/svg+xml" }),
    new File([], "empty.png", { type: "image/png" }),
    new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.png", { type: "image/png" }),
  ])("rejects invalid uploads before contacting a provider", async (file) => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect((await POST(request(file))).status).toBe(400); expect(fetch).not.toHaveBeenCalled();
  });
  it("explicitly labels the no-key fallback and does not claim the photo was analyzed", async () => {
    const data = await (await POST(request(image()))).json();
    expect(data.exampleMode).toBe(true); expect(data.notice).toContain("was not analyzed");
  });
  it("returns provider quota failures without concealing them as success", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { message: "Quota reached" } }, { status: 429 })));
    const response = await POST(request(image()));
    expect(response.status).toBe(429); expect(await response.json()).toEqual({ error: "Quota reached" });
  });
  it("returns readable JSON when the provider connection fails", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only"); vi.stubEnv("AI_PROVIDER", "openai");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network failure")));
    const response = await POST(request(image()));
    expect(response.status).toBe(502); expect((await response.json()).error).toContain("could not be reached");
  });
  it("rejects malformed model output", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ candidates: [{ content: { parts: [{ text: "not recipe json" }] } }] })));
    const response = await POST(request(image()));
    expect(response.status).toBe(502); expect((await response.json()).error).toContain("not valid recipe JSON");
  });
});
