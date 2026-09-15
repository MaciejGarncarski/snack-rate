/**
 * Build-time commit SHA, embedded by Vite (`vite.config.ts` resolves it from
 * `VITE_GIT_COMMIT_SHA` / `GITHUB_SHA` / `git rev-parse HEAD`).
 * Falls back to "unknown" when git metadata is unavailable (e.g. dev without git).
 */
export const GIT_COMMIT_SHA: string = import.meta.env.VITE_GIT_COMMIT_SHA ?? "unknown";
