import { LOW_RESOLUTION_WARNING_MIN_SIDE } from "#/const/image-const";

export function isLowResolution(width: number, height: number): boolean {
  if (!width || !height) return false;
  return Math.min(width, height) < LOW_RESOLUTION_WARNING_MIN_SIDE;
}
