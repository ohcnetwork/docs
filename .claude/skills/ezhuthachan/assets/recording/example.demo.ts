import { expect, test } from "@playwright/test";

import { startRecording, t } from "./kit";

// Shape of a flow recording. Copy this file to <flow-slug>.demo.ts and replace the body.
// The label keys and the URL below are placeholders: take the real ones from your facts.
//
// - The name passed to startRecording is the flow slug. Every output file starts with it.
// - Each step title is the step heading from the flow page, word for word. The captions and
//   the written page then say the same thing.
// - Find elements by translation key with t(), never by typed-in English text.
// - One page.goto, at the start. After that, reach every screen the way a person does.
test("Create a workspace", async ({ page }) => {
  const rec = await startRecording(page, "create-a-workspace");
  const { pointer } = rec;

  await rec.step("1. Open the workspace list", async () => {
    await page.goto("/facility/FACILITY_ID/settings/workspaces");
    const create = page.getByRole("button", { name: t("create_workspace") });
    await expect(create).toBeVisible();
    await pointer.reset();
    await rec.shot({ highlight: create });
    await pointer.click(create);
  });

  await rec.step("2. Name the workspace", async () => {
    const name = page.getByLabel(t("name"));
    await pointer.type(name, "Ward round");
    await rec.shot({ highlight: name });
  });

  await rec.finish();
});
