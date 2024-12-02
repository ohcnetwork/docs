# Guidelines to write cypress in CARE

## General Guidelines

- Follow the **Page Object Model (POM)** approach for structuring tests.
- Manually perform the workflow on the platform first, then plan the test before coding.
- Ensure all **CI/CD tests pass**, addressing any failures caused by recent changes and flakiness.
- Verify **API responses** for all form submissions and applicable scenarios using `cy.intercept()`
- To debug errors, go to the **Actions details page**, select **Home** from the left navigation bar, and scroll to the bottom of the Home page to download failure screenshots.

## Best Practices

- Reuse existing functions in **pageobject files**, commands.ts, and helper functions wherever possible.
- Use **element IDs or test-Ids** for selectors. Only use class selectors as a last resort.
- Add new test and object files **only when necessary**; otherwise, update existing related files.
- Remove unnecessary spacing and always add meaningful comments to simplify code reviews.
- Use reusable components or functions to handle dynamic functionality, ensuring consistency and efficiency
- **Avoid hardcoded waits** such as: `cy.wait()` and rely on dynamic waits like `.should()` or intercept-based waiting instead.