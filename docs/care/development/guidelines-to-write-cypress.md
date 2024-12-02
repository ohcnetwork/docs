# Guidelines to write cypress in CARE

## General Guidelines

- Follow the Page Object Model (POM) approach for structuring tests.
- Manually perform the workflow on the platform first, then plan the test before coding.
- Ensure all CI/CD tests pass, addressing any failures caused by recent changes and flakiness.
- Verify API responses for all form submissions and applicable scenarios using [`cy.intercept()`](https://github.com/ohcnetwork/care_fe/blob/2d9669e75f4f5a04b803d64bfaae2e1d1fb2a0d9/cypress/e2e/facility_spec/FacilityHomepage.cy.ts#L154).
- To debug errors, go to the Actions details page, select Home from the left navigation bar, and scroll to the bottom of the Home page to download failure screenshots.

## Best Practices

- Reuse existing functions in [pageobject](https://github.com/ohcnetwork/care_fe/tree/2d9669e75f4f5a04b803d64bfaae2e1d1fb2a0d9/cypress/pageobject) folders, [commands.ts](https://github.com/ohcnetwork/care_fe/blob/2d9669e75f4f5a04b803d64bfaae2e1d1fb2a0d9/cypress/support/commands.ts) files, and [helper](https://github.com/ohcnetwork/care_fe/tree/2d9669e75f4f5a04b803d64bfaae2e1d1fb2a0d9/cypress/pageobject/utils) functions wherever possible.
- Use element IDs or test-Ids for [selectors](https://docs.cypress.io/ui-coverage/core-concepts/element-identification#__docusaurus_skipToContent_fallback). Avoid using class-based selectors, as Tailwind CSS is used for styling.
- Add new test and object files only when necessary; otherwise, update existing related files.
- Remove unnecessary spacing and always add meaningful comments to simplify code reviews.
- Use reusable components or functions to handle dynamic functionality, ensuring consistency and efficiency
- Avoid hardcoded waits such as: `cy.wait()` and rely on dynamic waits like [`.should()`](https://github.com/ohcnetwork/care_fe/blob/2d9669e75f4f5a04b803d64bfaae2e1d1fb2a0d9/cypress/e2e/patient_spec/PatientConsultationCreation.cy.ts#L391) or intercept-based waiting instead.

## Resources

For more details, refer to the official [Cypress Documentation](https://docs.cypress.io/app/get-started/why-cypress)