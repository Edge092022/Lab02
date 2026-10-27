# TASK_DECOMPOSITION — Lab 02

## Scope

Exercise 1: Building Mini-React VNode & Mounting Engine.
Source: Lab 02, slide 15.
Exercise 2 and Exercise 3 will be decomposed later.

## Workflow

Functional Slicing → Contract-First Specification
→ Atomic Generation → Independent Verification.

AI assistance: ChatGPT.
Student responsibility: run checks, inspect results, and commit.

## WBS

- [x] P-01: Create project-rules.md.
- [x] P-02: Create TASK_DECOMPOSITION.md.
- [ ] E1-01: Set up Vite + TypeScript and define VNode contracts.
- [ ] E1-02: Implement and verify createTextElement.
- [ ] E1-03: Implement and verify createElement.
- [ ] M1: Commit verified element factories.
- [ ] E1-04: Implement and verify renderToDOM.
- [ ] M2: Commit verified DOM renderer.
- [ ] E1-05: Perform XSS verification and DevTools DOM audit.

## Contracts to Define Before Coding

### createTextElement

- Input: a string or number.
- Output: a text VNode containing its string value.
- Invariant: no HTML parsing or DOM mutation.

### createElement

- Input: a supported tag, props, and children.
- Output: a VNode with normalized children.
- Invariant: text children become text VNodes;
  nested child arrays are flattened;
  null, undefined, and boolean children are omitted.

### renderToDOM

- Input: a validated VNode.
- Output: a DOM Node.
- Invariant: text uses safe DOM APIs;
  children are rendered recursively;
  invalid node types are rejected;
  inline event-handler attributes are never generated.

## Required Git Milestones

### M1 — After Factory Verification

feat(core): implement createElement factory

### M2 — After Renderer Verification

feat(core): implement renderToDOM

Do not merge these milestones into one commit.

## Definition of Done

- [ ] All three required functions are implemented.
- [ ] TypeScript checks and production build pass.
- [ ] Factory checks pass for text and normalized children.
- [ ] Invalid VNode inputs are rejected by runtime typeguards.
- [ ] Rendered UI uses semantic elements without div-soup.
- [ ] <script>alert(1)</script> appears as literal text.
- [ ] No script element is created from the XSS test string.
- [ ] DevTools Elements matches the expected VNode tree.
- [ ] No unexpected or orphan nodes remain after mounting.
- [ ] Browser Console has no unexpected errors.
- [ ] Both required Git milestone commits exist separately.

## Verification Record

Not run yet. Record actual results after each check.

| Task  | Check                                   | Actual result |
| ----- | --------------------------------------- | ------------- |
| E1-02 | Text VNode factory                      | Pending       |
| E1-03 | Element factory and child normalization | Pending       |
| E1-04 | Recursive rendering and typeguards      | Pending       |
| E1-05 | XSS and DevTools audit                  | Pending       |

## AI Failure Audit

No confirmed AI failures recorded yet.
Only document failures with actual evidence and fixes.

## Exercise 2 — Reactive State Machine & Delegation Hub

### WBS

- [ ] E2-00: Define scope, contracts, and WBS.
- [ ] E2-01: Prepare the ex2 project and state contracts.
- [ ] E2-02: Implement and verify stateStore and resetCursor.
- [ ] M3: Commit state storage and cursor engine.
- [ ] E2-03: Implement and verify custom useState and render dispatcher.
- [ ] M4: Commit reactive useState dispatcher.
- [ ] E2-04: Implement and verify persistent root event delegation.
- [ ] M5: Commit root event delegation listener.
- [ ] E2-05: Assemble and verify Task Manager with dynamic filters.
- [ ] M6: Commit reactive todo application.

### Contracts

- State is stored in an indexed array.
- Reset the hook cursor before each application render.
- Each useState call captures its own stable slot index.
- Initialize a slot only when that slot has not been created.
- A setter updates its captured slot and requests rendering.
- Support direct values and functional state updates.
- Keep hook calls unconditional and in the same order.
- Attach application event listeners to the persistent root.
- Do not attach listeners to rendered buttons or inputs.
- Render UI from state; handle user events through state setters.

### Application Scope

- Show a task list.
- Add tasks.
- Toggle task completion.
- Filter tasks by ALL, ACTIVE, and COMPLETED.
- Use semantic HTML and labeled native controls.
- Render task text safely through DOM APIs.

### Required Git Milestones

M3: feat(state): implement stateStore and resetCursor engine
M4: feat(state): implement reactive useState dispatcher
M5: feat(events): attach root event delegation listener
M6: feat(ui): assemble reactive todo application

### Verification

- [ ] State survives repeated renders.
- [ ] Multiple hooks keep independent state slots.
- [ ] Setters update the correct slot.
- [ ] Functional updates use the previous state.
- [ ] UI updates after adding or toggling a task.
- [ ] All three filters show the expected tasks.
- [ ] Repeated rendering does not duplicate root listeners.
- [ ] DevTools shows no listeners directly on child controls.
- [ ] Keyboard operation works for the implemented controls.
- [ ] Build passes and Console has no unexpected errors.
- [ ] All four milestone commits exist separately.

Actual verification results: Pending.

## Exercise 3 — Resilient State Machine & Skeleton Loader

### WBS

- [ ] E3-00: Define contracts and WBS.
- [ ] E3-01: Prepare ex3 and define state types.
- [ ] E3-02: Implement and verify async state transitions.
- [ ] E3-03: Implement state views, skeleton CSS, and Retry Connection.
- [ ] E3-04: Verify all states, retry, and request consistency.
- [ ] M7: Commit verified multi-state component.

### State Contract

Use a TypeScript discriminated union:

- IDLE: no request has started.
- LOADING: a request is pending.
- SUCCESS: contains successfully loaded data.
- ERROR: contains a human-readable error message.

Only SUCCESS contains data.
Only ERROR contains an error message.

### Transition Contract

- IDLE -> LOADING when loading starts.
- LOADING -> SUCCESS when the current request succeeds.
- LOADING -> ERROR when the current request fails.
- ERROR -> LOADING when Retry Connection is activated.
- Ignore repeated load actions while already loading.
- Catch request errors; do not leave rejected promises unhandled.

### UI Contract

- IDLE: show a Load Data button.
- LOADING: show animated pulsing skeleton placeholders.
- SUCCESS: show loaded items.
- ERROR: show an error message and Retry Connection button.
- Render only the view corresponding to the current state.
- Use semantic HTML, safe text APIs, and root event delegation.
- Respect prefers-reduced-motion for skeleton animation.
- Provide accessible loading and error feedback.

### Verification

- [ ] Initial view is IDLE.
- [ ] Starting a request shows LOADING and skeletons.
- [ ] Successful request shows SUCCESS and data.
- [ ] Failed request shows ERROR and readable feedback.
- [ ] Retry Connection starts another request.
- [ ] Retry can recover from ERROR to SUCCESS.
- [ ] Repeated load actions do not create overlapping requests.
- [ ] Keyboard operation works.
- [ ] Build passes; no unexpected Console errors.

### Required Git Milestone

feat(ui): implement multi-state data component with skeleton feedback

Actual verification results: Pending.

## Homework 1 — Accessible Data Grid

### WBS

- [x] HW1-01: Inspect the project and prepare a separate HW1 workspace.
- [ ] HW1-02: Define the Data Grid TypeScript interfaces.
- [ ] HW1-03: Create the semantic grid structure and render data.
- [ ] HW1-04: Add sorting.
- [ ] HW1-05: Add filtering.
- [ ] HW1-06: Add pagination.
- [ ] HW1-07: Add keyboard navigation and selection.
- [ ] HW1-08: Verify accessibility, screen reader support, and color contrast.
- [ ] HW1-09: Run Lighthouse and record actual results.

### Requirements to Verify

- [ ] Use table, thead, tbody, th with scope="col", and button.
- [ ] Provide role="grid", role="row", and role="gridcell" semantics.
- [ ] Support sorting, filtering, and pagination.
- [ ] Arrow keys navigate between grid cells.
- [ ] Enter selects and Space toggles as required.
- [ ] Check against WCAG 2.2 Level AA, including screen reader support.
- [ ] Check the required 4.5:1 color contrast.
- [ ] Lighthouse Accessibility score is 100/100.
- [ ] Lighthouse Best Practices score is 100/100.

### Verification Record

Record actual results only after performing each check.

| Task             | Check                                         | Actual result |
| ---------------- | --------------------------------------------- | ------------- |
| HW1-01           | Vite page opened in browser; production build | Passed        |
| HW1-02 to HW1-09 | Not yet performed                             | Pending       |
