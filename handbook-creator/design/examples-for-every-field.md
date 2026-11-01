# Examples in every input — UX contract

Every editable answer field must have a **field-specific, realistic example**. Never show an empty unlabeled textbox with no guidance.

## Behavior
- For single-line and multi-line text, show a short example inside the empty field (placeholder), plus an accessible **Example** hint adjacent to the field so it remains available after typing.
- For dates, show a sample date in readable text near the control; for numbers, show a realistic range or sample; for yes/no, show a brief example of when to choose each if ambiguous.
- For uploads, explain acceptable formats and show an example of the expected image (company logo), without making upload required.
- For complex policy answers, offer an **Use this example as a starting point** action, which copies clearly labeled sample text into the editable field **only when the customer explicitly chooses it**.
- Examples must never silently become actual customer answers. Placeholders are not saved or exported as policy decisions.
- Avoid invented legal assertions, mandatory employment rules, or universal policy promises in examples. Flag jurisdiction-sensitive examples for legal review.
- All non-legally-essential entries retain **Skip for Now**.
- Examples must be brief, restaurant-specific, plain English, and appropriate for first-time owners.
- Include help text for every field, not just the first section. Maintain examples in the shared question library so Windows and web stay identical.

## Sample prompts
- Restaurant name: "Example: Riverside Family Grill".
- About the restaurant: "Example: We are a neighborhood restaurant focused on fresh food, respectful teamwork, and friendly service."
- Attendance reporting: "Example: Call the manager on duty as soon as you know you cannot work your shift."
- Uniforms: "Example: Black non-slip shoes, clean dark pants, and a company-provided shirt."
- Shift swaps: "Example: Both employees must notify a manager and receive approval before changing the schedule."
- Logo upload: "Example: Your restaurant's PNG or JPG logo. You can skip this and add it later."

## Acceptance tests
- Every question has a useful example or contextual selection guidance.
- Empty examples disappear from typed value but remain available via hint/help.
- Example text never enters saved project, preview, or export without explicit customer selection.
- Keyboard and screen-reader users can access the hint.
- Skipping fields remains possible; example text never blocks progress.

Status: specification; input components and shared question data still need integration.
