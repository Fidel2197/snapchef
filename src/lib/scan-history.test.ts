import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { insertScan, listScans, removeScan } from "./scan-history";
import { exampleResult } from "./snapchef-content";
import type { SavedScan } from "./snapchef-types";

const result = { ...exampleResult, exampleMode: false };
const saved: SavedScan = { id: "scan-1", dish_name: result.dishName, confidence: result.confidence, summary: result.summary, result, image_path: null, created_at: "2026-09-20T00:00:00Z" };
function clientMock(response: { data?: unknown; error?: { message: string } | null } = { data: [saved], error: null }) {
  const query = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn(), insert: vi.fn(), single: vi.fn(), delete: vi.fn(), then: vi.fn() };
  for (const method of [query.select, query.eq, query.order, query.insert, query.delete]) method.mockReturnValue(query);
  query.limit.mockResolvedValue(response); query.single.mockResolvedValue(response);
  query.then.mockImplementation((resolve) => Promise.resolve(response).then(resolve));
  const storage = { upload: vi.fn().mockResolvedValue({ error: null }), remove: vi.fn().mockResolvedValue({ error: null }) };
  const from = vi.fn().mockReturnValue(query);
  const client = { from, storage: { from: vi.fn().mockReturnValue(storage) } } as unknown as SupabaseClient;
  return { client, query, storage, from };
}
describe("saved scan persistence", () => {
  it("loads the signed-in owner's latest ten scans", async () => {
    const { client, query } = clientMock();
    expect(await listScans(client, "user-1")).toEqual([saved]);
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(10);
  });
  it("surfaces history load failure", async () => {
    const { client } = clientMock({ error: { message: "Database unavailable" } });
    await expect(listScans(client, "user-1")).rejects.toThrow("Database unavailable");
  });
  it("stores recipe results with the owner and returns the saved record", async () => {
    const { client, query } = clientMock({ data: saved, error: null });
    expect((await insertScan(client, "user-1", result, null)).scan).toEqual(saved);
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "user-1", result, dish_name: result.dishName }));
  });
  it("does not persist a fixed example", async () => {
    const { client, from } = clientMock();
    await expect(insertScan(client, "user-1", exampleResult, null)).rejects.toThrow("Example results are not saved");
    expect(from).not.toHaveBeenCalled();
  });
  it("keeps the recipe and returns a warning when image storage fails", async () => {
    const { client, storage, query } = clientMock({ data: saved, error: null });
    storage.upload.mockResolvedValue({ error: { message: "Storage unavailable" } });
    const response = await insertScan(client, "user-1", result, new File(["image"], "plate.png", { type: "image/png" }));
    expect(response.imageWarning).toBe(true);
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({ image_path: null }));
  });
  it("cleans up an uploaded image when saving its recipe fails", async () => {
    const { client, storage } = clientMock({ error: { message: "Insert failed" } });
    await expect(insertScan(client, "user-1", result, new File(["image"], "plate.png", { type: "image/png" }))).rejects.toThrow("Insert failed");
    expect(storage.remove).toHaveBeenCalledWith([expect.stringMatching(/^user-1\/.+\.png$/)]);
  });
  it("scopes deletion to the owner and removes its stored photo", async () => {
    const { client, storage, query } = clientMock({ error: null });
    await removeScan(client, "user-1", { ...saved, image_path: "user-1/photo.png" });
    expect(query.eq).toHaveBeenCalledWith("id", "scan-1"); expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(storage.remove).toHaveBeenCalledWith(["user-1/photo.png"]);
  });
  it("does not remove the photo if database deletion failed", async () => {
    const { client, storage } = clientMock({ error: { message: "Delete failed" } });
    await expect(removeScan(client, "user-1", { ...saved, image_path: "user-1/photo.png" })).rejects.toThrow("Delete failed");
    expect(storage.remove).not.toHaveBeenCalled();
  });
});
