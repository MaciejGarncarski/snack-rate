export function getGuestIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)guest_id=([^;]*)/u);
  return match ? match[1] : null;
}
