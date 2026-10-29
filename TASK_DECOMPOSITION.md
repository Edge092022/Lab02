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
- [x] HW2-07: Implement and verify the analyser module and FFT configuration.
- [x] HW2-08: Implement and verify the Canvas visualizer lifecycle.
- [x] HW2-09: Create the semantic, keyboard-accessible control interface.
- [x] HW2-10: Integrate controls through a lifecycle-managed application controller.
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
| HW2-07 | FFT configuration and frequency data | TypeScript and production build passed; seven browser analyser checks passed: fftSize=512, 256 bins, reused byte array, nonzero real-signal data, expected frequency peak, repeated disposal/read rejection, and external context ownership; sampleRate=48000 Hz, test frequency=750 Hz, peakBin=8, peakValue=255 |
| HW2-08 | Rendering, single animation loop, and loop cancellation | Student confirmed successful build; seven controlled-scheduler checks passed for drawing and lifecycle, with scheduler restored; four real requestAnimationFrame checks passed for data reads, stop, restart, and disposal; fps and memory leaks not measured |
| HW2-09 | Semantic structure, labels, and keyboard operation | Student confirmed TypeScript/build success, page display, label-to-input focus, Tab/Shift+Tab order and visible focus, native button keyboard activation, narrow layout without horizontal overflow, semantic DOM/status region, and no unexpected Console errors; audio actions not yet integrated; full accessibility assessment not performed |
| HW2-10 | Integrated controls and listener lifecycle | Student confirmed TypeScript/build success, audible playback, animated Canvas, stop/replay, keyboard controls, cancellation of pending tasks, and recovery after cancellation; six cleanup checks passed for delegated listener lifecycle, single context creation, repeated disposal, context closure, stale-update prevention, and remount; corrected DevTools test-helper error documented in AI_FAILURE_AUDIT.md; fps and memory leaks not measured |
| HW2-11 | Concurrent requests, failures, and cancellation scenarios | Screenshot shows A/B/C completion and request order, HTML decode failure followed by successful C, and successful after-cancel task; cancellation overlap scenario and three identical-URL tasks not fully evidenced; unhandled-rejection check not confirmed; further checks skipped at student request |
| HW2-12 | Recorded browser, workload, and measured rendering performance | Performance screenshot at localhost:4173 covers 10.69s: scripting 359ms, system 351ms, painting 187ms, rendering 91ms; Frames track displays a 2033.3ms interval requiring investigation; browser version, refresh rate, throttling, visibility, and continuous audio conditions not confirmed; stable 60fps not verified |
| HW2-13 | Repeated lifecycle cycles and memory/resource observations | Three heap snapshots observed: S1 2.9MB/52280 objects, S2 2.9MB/53088 objects, S3 3.0MB/53734 objects; displayed sizes are rounded; constructor counts and retainer paths not established; further filtering skipped at student request; cause of growth undetermined and absence of memory leaks not verified |

### Git Policy

- Review the diff before staging.
- Stage only files belonging to the current task.
- Use a separate Conventional Commit for each verified task.
- Do not include Exercise, HW1, or unrelated editor files.
- Do not mark a task complete before actual verification.

### AI Failure Audit

Record only confirmed AI errors with evidence and the applied fix
in AI_FAILURE_AUDIT.md.

## Homework 3 — High-Concurrency Flash-Sale E-Commerce Engine

### Scope and Simulation Boundary

- Implement separately in hw3; preserve existing assignments.
- Simulate a Vietnam flash sale with a countdown and limited stock.
- Simulate concurrent purchase requests against one shared in-memory engine.
- This browser simulation does not provide server-side or cross-device locking.
- Define concrete inputs, outputs, errors, and invariants before each module.
- Confirm actual verification before marking any task complete.

### WBS

- [x] HW3-00: Define scope, functional slices, and verification plan.
- [x] HW3-01: Prepare a separate Vite + TypeScript workspace.
- [ ] HW3-02: Define inventory types, transitions, and public API contracts.
- [x] HW3-03: Implement and verify the anti-drift countdown module.
- [x] HW3-04: Implement and verify atomic inventory reservation.
- [x] HW3-05: Implement and verify reservation expiry and stock release.
- [ ] HW3-06: Implement and verify checkout and duplicate-request handling.
- [ ] HW3-07: Create the semantic, keyboard-accessible interface.
- [ ] HW3-08: Integrate the application controller and lifecycle cleanup.
- [ ] HW3-09: Implement and verify a concurrent-request simulation module.
- [ ] HW3-10: Independently verify timing, inventory invariants, and recovery.
- [ ] HW3-11: Document at least three evidenced AI flaws and their fixes.

### Initial Contracts

#### Countdown

- Use an absolute deadline: targetTime = Date.now() + durationMs.
- Calculate remaining time from the deadline on every animation frame.
- Never subtract a fixed interval from the previous remaining value.
- Reject negative or non-finite durations.
- Clamp remaining time to zero.
- Stop scheduling frames after completion.
- Cancellation must be safe when repeated, including from onTick.
- Define callback-error behavior before implementation.
- Background tabs may delay callbacks; recalculate on resumption.
- System clock changes can affect Date.now(); do not claim immunity.
- Verify deadline accuracy separately from callback/render frequency.

#### Inventory and Reservations

- Reservation states: RESERVED, EXPIRED, and CHECKED_OUT.
- A successful reservation has a unique ID and an absolute expiry time.
- Accept positive integer quantities only.
- Check availability and reserve stock in one synchronous operation.
- Reconcile expired reservations before availability-sensitive operations.
- Reject checkout when now >= expiresAt, even if cleanup ran late.
- Release expired stock exactly once.
- Successful checkout consumes reserved stock exactly once.
- Repeated checkout for a successful reservation must not consume more stock.
- Reusing a request ID with conflicting input must be rejected.
- Preserve: initialStock = availableStock + reservedStock + soldStock.
- All stock counts remain non-negative integers.
- Return snapshots that cannot mutate internal state.
- Define sale-end behavior and disposal semantics before implementation.

#### Interface and Controller

- Use semantic HTML, labeled controls, and visible keyboard focus.
- Use textContent or safe DOM construction for dynamic text.
- Use delegated events where appropriate.
- Display countdown, available stock, reservations, and outcomes.
- Avoid announcing millisecond updates continuously to screen readers.
- Own and clean up timers, animation frames, and event listeners.
- Prevent stale callbacks from changing disposed UI.

#### Concurrency Simulation

- Route all simulated buyers through the same inventory engine.
- Define request count, stock, quantity, and scheduling conditions.
- Collect successful and rejected outcomes.
- Verify no overselling and conservation of stock.
- Do not describe a single-browser test as distributed load testing.

### Planned Atomic Commits

1. docs(hw3): define flash-sale scope and task decomposition
2. chore(hw3): scaffold isolated TypeScript workspace
3. feat(hw3): define inventory state contracts
4. feat(hw3): implement deadline-based countdown
5. feat(hw3): implement atomic inventory reservation
6. feat(hw3): implement reservation expiry
7. feat(hw3): implement idempotent checkout
8. feat(hw3): add accessible flash-sale interface
9. feat(hw3): integrate application lifecycle
10. feat(hw3): add concurrent purchase simulation
11. test(hw3): verify timing and inventory invariants
12. docs(hw3): document evidenced AI failures and fixes

Commit only the files for the current verified task.
Do not create empty commits to reach the required count.

### Verification Record

| Task | Check | Actual result |
| --- | --- | --- |
| HW3-00 | Scope, WBS, and contracts reviewed | Student confirmed the appended HW3 plan is correct; initial plan committed in 834a9b7 |
| HW3-01 | Separate workspace, TypeScript, and build | Student confirmed npm run build passed, sample page displayed, counter worked, and Console had no unexpected errors |
| HW3-02 | API and transition contracts | Pending |
| HW3-03 | Deadline calculation, zero, invalid inputs, cancellation, delayed frames | Build passed; student screenshot confirmed six controlled-clock/scheduler checks passed: delayed frames, zero duration, repeated cancellation, cancellation inside callback, invalid durations, and callback errors; globals restored; real-browser timing not yet measured |
| HW3-04 | Valid/invalid quantities, insufficient stock, atomic reservation | Build passed; student screenshot confirmed 10 module checks passed, including duplicate/conflicting requests, invalid inputs, sale deadline, unchanged input, detached result, timestamp errors, and 100 sequential requests with exactly 5 accepted for stock 5; concurrent engine behavior not yet tested |
| HW3-05 | Exact expiry boundary, delayed cleanup, release once | Build passed; student screenshot confirmed nine checks passed: before/exact deadline, repeated expiry, delayed cleanup, terminal states, unchanged input, stock conservation, invalid timestamps, and empty inventory; automatic scheduling not yet tested |
| HW3-06 | Checkout, expired checkout, repeated and conflicting requests | Pending |
| HW3-07 | Semantic structure, labels, keyboard, responsive layout | Pending |
| HW3-08 | Integrated flow, disposal, remount, stale callbacks | Pending |
| HW3-09 | Recorded workload, outcomes, no overselling | Pending |
| HW3-10 | Independent checks, build, Console, invariant preservation | Pending |
| HW3-11 | At least three actual AI flaws with evidence, fixes, and rechecks | Pending |

### AI Failure Audit Policy

- Keep the existing AI_FAILURE_AUDIT.md content.
- Add HW3 findings only when supported by actual evidence.
- For each finding, record the AI suggestion, observed flaw, reproduction,
  expected/actual behavior, fix, and actual verification result.
- Do not count an unverified risk as a confirmed failure.
- Do not deliberately introduce bugs to satisfy the audit requirement.
