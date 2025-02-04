# Guidelines to write cypress in CARE

## General Guidelines

- Follow the Page Object Model (POM) approach for structuring tests.
- Manually perform the workflow on the platform first, then plan the test before coding.
- Ensure all CI/CD tests pass, addressing any failures caused by recent changes and flakiness.
- Verify API responses for all form submissions and applicable scenarios using [`cy.intercept()`](https://github.com/ohcnetwork/care_fe/blob/f2db2ba9c98b20cc8b58a5b75061ef1ebc28de53/cypress/pageObject/Users/UserCreation.ts#L149).
- To debug errors, go to the Actions details page, select Home from the left navigation bar, and scroll to the bottom of the Home page to download failure screenshots.

## Best Practices

- Reuse existing functions in [pageobject](https://github.com/ohcnetwork/care_fe/tree/f2db2ba9c98b20cc8b58a5b75061ef1ebc28de53/cypress/pageObject) folders, [commands.ts](https://github.com/ohcnetwork/care_fe/blob/f2db2ba9c98b20cc8b58a5b75061ef1ebc28de53/cypress/support/commands.ts) files, and [helper](https://github.com/ohcnetwork/care_fe/tree/f2db2ba9c98b20cc8b58a5b75061ef1ebc28de53/cypress/utils) functions wherever possible.
- Use element IDs or test-Ids for [selectors](https://github.com/ohcnetwork/care_fe/blob/f2db2ba9c98b20cc8b58a5b75061ef1ebc28de53/cypress/pageObject/Users/UserCreation.ts#L18). Avoid using class-based selectors, as Tailwind CSS is used for styling.
- Add new test and object files only when necessary; otherwise, update existing related files.
- Remove unnecessary spacing and always add meaningful comments to simplify code reviews.
- Use reusable components or functions to handle dynamic functionality, ensuring consistency and efficiency
- Avoid hardcoded waits such as: `cy.wait()` and rely on dynamic waits like [`.should()`](https://github.com/ohcnetwork/care_fe/blob/f2db2ba9c98b20cc8b58a5b75061ef1ebc28de53/cypress/pageObject/Patients/PatientCreation.ts#L72) or intercept-based waiting instead.

## Resources

For more details, refer to the official [Cypress Documentation](https://docs.cypress.io/app/get-started/why-cypress)
