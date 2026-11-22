import { test as setup } from "@playwright/test";

// Signs in through the login page and saves the session for the flow recordings.
// Credentials come from the environment and are never written to a file:
//   EZ_USERNAME, EZ_PASSWORD
//
// The selectors below mirror tests/setup/auth.setup.ts in care_fe as of November 2026.
// Compare them with that file in the pinned checkout before the first run, and follow it if it differs.
setup("sign in", async ({ page }) => {
  const username = process.env.EZ_USERNAME;
  const password = process.env.EZ_PASSWORD;
  if (!username || !password) throw new Error("Set EZ_USERNAME and EZ_PASSWORD for the account the user gave you.");

  await page.goto("/login");
  await page.getByRole("textbox", { name: /username/i }).fill(username);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("login"), { timeout: 20_000 });

  await page.context().storageState({ path: ".auth/user.json" });
});
