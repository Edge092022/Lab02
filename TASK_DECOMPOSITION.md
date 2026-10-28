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
- [x] HW1-02: Define the Data Grid TypeScript interfaces.
- [x] HW1-03: Create the semantic grid structure and render data.
- [x] HW1-04: Add sorting.
- [x] HW1-05: Add filtering.
- [x] HW1-06: Add pagination.
- [x] HW1-07: Add keyboard navigation and selection.
- [ ] HW1-08: Verify accessibility, screen reader support, and color contrast.
- [x] HW1-09: Run Lighthouse and record actual results.

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

| Task             | Check                                                               | Actual result            |
| ---------------- | ------------------------------------------------------------------- | ------------------------ |
| HW1-01           | Vite page opened in browser; production build                       | Passed                   |
| HW1-02 to HW1-07 | Detailed verification record                                        | Pending                  |
| HW1-08           | Narrator: selection, sorting direction, and page status announced   | Checked by student       |
| HW1-08           | DevTools text contrast: white background 21:1; selected row 17.21:1 | Checked on sampled cells |
| HW1-08           | Full WCAG 2.2 AA assessment                                         | Not yet verified         |
| HW1-09           | Lighthouse Desktop: Accessibility 100/100; Best Practices 100/100   | Passed                   |

## Homework 2 — Concurrent FIFO Audio Visualizer Queue Engine

### Scope

Implement HW2 in a separate hw2 directory.
Preserve all Exercise and HW1 files.

Workflow:
Functional Slicing → Contract-First → Atomic Generation
→ Independent Verification.

### Initial Design Decisions

- The queue accepts multiple enqueue calls while another task is active.
- Process one download-and-decode task at a time in FIFO order.
- FIFO applies to download and decode processing; playback is separate.
- enqueue resolves with an AudioBuffer or rejects on failure/cancellation.
- Cancellation affects the active task and all waiting tasks.
- Cancelled tasks reject with AbortError.
- AbortController cancels fetch; an active decode cannot be directly aborted.
- Ignore cancelled decode results and wait for that decode to finish
  before starting another task.
- Use analyser fftSize = 512, producing 256 frequency bins.
- Use Canvas with requestAnimationFrame.
- These are implementation decisions based on the supplied specification.

### WBS

- [x] HW2-00: Review requirements and define the HW2 WBS.
- [x] HW2-01: Prepare a separate Vite + TypeScript workspace in hw2.
- [x] HW2-02: Define queue types, public API, and lifecycle contracts.
- [x] HW2-03: Implement and verify the audio download and decode module.
- [x] HW2-04: Implement and verify FIFO task scheduling.
- [x] HW2-05: Implement and verify task cancellation and stale-result handling.
- [x] HW2-06: Implement and verify audio playback and source-node cleanup.
- [ ] HW2-07: Implement and verify the analyser module and FFT configuration.
- [ ] HW2-08: Implement and verify the Canvas visualizer lifecycle.
- [ ] HW2-09: Create the semantic, keyboard-accessible control interface.
- [ ] HW2-10: Integrate controls through a lifecycle-managed application controller.
- [ ] HW2-11: Verify concurrent requests, FIFO behavior, errors, and cancellation.
- [ ] HW2-12: Measure rendering performance under recorded conditions.
- [ ] HW2-13: Inspect memory and resource cleanup across repeated lifecycle cycles.

Each implementation task must define its concrete contract before coding.
Add supporting verification files only when needed for the current task.

### Contract Requirements

#### Queue

- Define FIFO ordering and the maximum number of active tasks.
- Define whether FIFO applies to task start, completion, or playback.
- Every accepted task must eventually resolve or reject.
- A failed or cancelled task must not block later eligible tasks.
- Define the behavior of cancellation and disposal.

#### Download and Decode

- Define URL input, AudioBuffer output, and error behavior.
- Check HTTP response status before decoding.
- Pass an AbortSignal to fetch.
- Audio decoding does not accept an AbortSignal.
- Ignore a decoded result if its task has become invalid.
- Prevent stale results from triggering playback or UI updates.

#### Playback and Analysis

- Define ownership and lifecycle of the AudioContext and audio nodes.
- Create a new AudioBufferSourceNode for each playback.
- Release source connections and handlers when playback ends or is stopped.
- Define the analyser fftSize and resulting frequencyBinCount explicitly.
- Define cleanup behavior for partial initialization and repeated disposal.

#### Visualizer

- Use requestAnimationFrame for rendering.
- Reuse frequency data storage between frames.
- Prevent duplicate animation loops.
- Cancel the animation loop during cleanup.
- Verify performance through measurement before claiming 60fps.

#### Interface

- Use semantic HTML and labeled native controls.
- Support keyboard operation.
- Render user-controlled text with safe DOM APIs.
- Use event delegation where appropriate.
- Remove owned listeners during cleanup.
- Show task status and readable error feedback.

### Verification Record

Record actual results only after performing each check.

| Task   | Check                                                          | Actual result                                                                                                                                              |
| ------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HW2-00 | Requirements, assumptions, and WBS reviewed                    | Pending                                                                                                                                                    |
| HW2-01 | Independent workspace, TypeScript check, and build             | Scaffold committed in 6fca27f; TypeScript and production build passed; student confirmed page display, counter operation, and no unexpected Console errors |
| HW2-02 | Contracts defined; TypeScript and production build | audio-queue-contract.ts created; npm run build (tsc && vite build) completed successfully; queue runtime behavior not yet implemented or tested |
| HW2-03 | Audio loading, error handling, and cancellation | TypeScript and production build passed; browser checks passed for valid WAV (1 channel, 0.1s), blank URL, empty audio, invalid audio, and pre-aborted signal; controlled mocks passed for HTTP 503 before decode, cancellation during fetch, and cancellation during decode with result discarded; fetch restored after tests |
| HW2-04 | FIFO ordering and active-task limit | Seven browser checks with a controlled loader passed: FIFO order, blank URL rejection, buffer delivery, continuation after failure, and restart after idle; maxActive=1 and final active=0; TypeScript and production build passed after fixing TS1294; queue cancellation not yet implemented |
| HW2-05 | Cancellation, promise settlement, and stale-result rejection | TypeScript and production build passed; seven controlled-loader cancellation/disposal checks passed, including immediate rejection, waiting for the old loader, discarded cancelled results, and rejection after disposal; seven FIFO regression checks passed with order A,B,C,D, maxActive=1, and final active=0 |
| HW2-06 | Playback end, stop, replacement, and source cleanup | TypeScript and production build passed; seven browser playback lifecycle checks passed; four cleanup checks passed for natural end, stop, replacement, and disposal, each with one disconnect call and cleared buffer/handler; audible output not confirmed; memory leaks not measured |
| HW2-07 | FFT configuration and frequency data                           | Pending                                                                                                                                                    |
| HW2-08 | Rendering, single animation loop, and loop cancellation        | Pending                                                                                                                                                    |
| HW2-09 | Semantic structure, labels, and keyboard operation             | Pending                                                                                                                                                    |
| HW2-10 | Integrated controls and listener lifecycle                     | Pending                                                                                                                                                    |
| HW2-11 | Concurrent requests, failures, and cancellation scenarios      | Pending                                                                                                                                                    |
| HW2-12 | Recorded browser, workload, and measured rendering performance | Pending                                                                                                                                                    |
| HW2-13 | Repeated lifecycle cycles and memory/resource observations     | Pending                                                                                                                                                    |

### Git Policy

- Review the diff before staging.
- Stage only files belonging to the current task.
- Use a separate Conventional Commit for each verified task.
- Do not include Exercise, HW1, or unrelated editor files.
- Do not mark a task complete before actual verification.

### AI Failure Audit

Record only confirmed AI errors with evidence and the applied fix
in AI_FAILURE_AUDIT.md.
