import type { SnapChefResult } from "./snapchef-types";
import { ensureClientResult, isApiError } from "./recipe-result";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function imageValidationError(file: Pick<File, "type" | "size">) {
  if (!IMAGE_TYPES.includes(file.type)) return "Please choose a JPG, PNG, or WebP image.";
  if (file.size === 0) return "That image is empty. Please choose another file.";
  if (file.size > MAX_IMAGE_BYTES) return "Please choose an image under 3 MB.";
  return "";
}

export async function requestAnalysis(file: File, options: { preferences: string; servings: string; groceryLocation: string }) {
  const validation = imageValidationError(file);
  if (validation) throw new Error(validation);
  const form = new FormData();
  form.append("image", file);
  Object.entries(options).forEach(([key, value]) => form.append(key, value.trim()));
  let response: Response;
  try {
    response = await fetch("/api/analyze", { method: "POST", body: form, signal: AbortSignal.timeout(60_000) });
  } catch {
    throw new Error("Could not reach SnapChef. Check your connection and try again.");
  }
  let data: unknown;
  try { data = await response.json(); }
  catch { throw new Error("SnapChef returned an unreadable response. Please try again."); }
  if (isApiError(data)) throw new Error(data.error);
  if (!response.ok) throw new Error("SnapChef could not analyze that image. Please try again.");
  if (!data || typeof data !== "object" || !("dishName" in data) || !("recipe" in data) || !("shoppingPlan" in data)) {
    throw new Error("SnapChef returned an incomplete recipe. Please try again.");
  }
  return ensureClientResult(data as SnapChefResult);
}
