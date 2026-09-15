import { expect, test } from "@playwright/test";

test("health endpoint reports status and build commit", async ({ request }) => {
  const response = await request.get("/health");

  expect(response.ok()).toBe(true);

  const body = await response.json();
  expect(body.status).toBe("ok");
  expect(body.commit).toMatch(/^([0-9a-f]{8}|unknown)$/);
});
