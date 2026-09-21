import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavedScan, SnapChefResult } from "./snapchef-types";
import { ensureClientResult } from "./recipe-result";

const fields = "id,dish_name,confidence,summary,result,image_path,created_at";

export async function listScans(client: SupabaseClient, userId: string): Promise<SavedScan[]> {
  const { data, error } = await client.from("snapchef_scans").select(fields)
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
  if (error) throw new Error(error.message);
  return ((data ?? []) as SavedScan[]).map((scan) => ({ ...scan, result: ensureClientResult(scan.result) }));
}

export function scanImageUrl(client: SupabaseClient | null, scan: SavedScan) {
  if (!scan.image_path || scan.image_path === "local-preview") return "";
  if (scan.image_path.startsWith("https://")) return scan.image_path;
  return client?.storage.from("snapchef-scans").getPublicUrl(scan.image_path).data.publicUrl || "";
}

export async function insertScan(client: SupabaseClient, userId: string, result: SnapChefResult, file: File | null) {
  if (result.exampleMode) throw new Error("Example results are not saved. Upload a food photo first.");
  let imagePath: string | null = null;
  let imageWarning = false;
  if (file) {
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from("snapchef-scans").upload(path, file, { contentType: file.type, upsert: false });
    if (error) imageWarning = true;
    else imagePath = path;
  }
  const { data, error } = await client.from("snapchef_scans").insert({
    user_id: userId, dish_name: result.dishName, confidence: result.confidence,
    summary: result.summary, result, image_path: imagePath,
  }).select(fields).single();
  if (error || !data) {
    if (imagePath) await client.storage.from("snapchef-scans").remove([imagePath]);
    throw new Error(error?.message || "The recipe could not be saved. Please try again.");
  }
  const scan = data as SavedScan;
  return { scan: { ...scan, result: ensureClientResult(scan.result) }, imageWarning };
}

export async function removeScan(client: SupabaseClient, userId: string, scan: SavedScan) {
  const { error } = await client.from("snapchef_scans").delete().eq("id", scan.id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (scan.image_path && !scan.image_path.startsWith("http") && scan.image_path !== "local-preview") {
    const { error: imageError } = await client.storage.from("snapchef-scans").remove([scan.image_path]);
    return imageError ? "Recipe deleted, but its image could not be removed from storage." : "";
  }
  return "";
}
