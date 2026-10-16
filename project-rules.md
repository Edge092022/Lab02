# Project Rules — Lab 02

## Scope
- Complete Exercise 1, then Exercise 2, then Exercise 3.
- Do not implement homework or unrelated features.
- Finish and verify one sub-task before starting the next.

## Workflow
1. Functional Slicing: split work into isolated sub-tasks.
2. Contract-First: define TypeScript interfaces and function
   inputs, outputs, and invariants before implementation.
3. Atomic Generation: generate one function or module per task.
4. Independent Verification: inspect tests, DevTools, and git diff.
- Track tasks and actual verification in TASK_DECOMPOSITION.md.
- Never claim a check passed without running it.

## Implementation
- Use const and let; no var or implicit globals.
- No raw innerHTML injection.
- No inline HTML event handlers.
- Use centralized event delegation for application events.
- Use keydown with event.key or event.code when needed.
- Use Vite; no standalone Babel.
- Prefer semantic HTML and native accessible controls.
- Apply relevant WCAG 2.2 AA criteria to implemented UI.
- Do not rewrite completed code without a concrete reason.

## Exercise 1 Contract
- Implement createTextElement, createElement, and renderToDOM.
- Define the VNode and props contracts before implementation.
- Validate supported node and prop types explicitly.
- Render text through safe DOM text APIs.
- Produce semantic elements without div-soup.
- Verify that <script>alert(1)</script> remains literal text.
- Inspect Elements: DOM must match the VNode tree,
  with no unexpected or orphan nodes.

## Required Exercise 1 Git Milestones
1. After verifying the element factories:
   feat(core): implement createElement factory
2. After verifying the DOM renderer:
   feat(core): implement renderToDOM

Keep these commits separate and preserve their order.
Stage only files belonging to the current milestone.

## Audit Evidence
- Record checks only after performing them.
- Record AI failures only when supported by actual evidence.
- Never invent bugs, screenshots, test results, or audit findings.