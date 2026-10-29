# AI Failure Audit — Lab 02

## Audit 01 — Circular children cause stack overflow

### Source

AI-assisted implementation of createElement in:
ex1/src/mini-react.ts

Related AI task: E1-03 — implement createElement.

### Observed failure

DevTools Console reported:

- Error type: RangeError
- Error message: Maximum call stack size exceeded

### Cause and impact

The recursive flattening algorithm did not detect circular arrays.
A self-referencing array caused uncontrolled recursion and prevented
the factory from completing.

This is an input-validation and robustness defect.
The test does not demonstrate XSS.

### Fix

Track arrays in the current recursion path using WeakSet.
Throw TypeError when an active array is encountered again.
Remove arrays from the set after processing so shared,
non-circular arrays remain valid.

### Verification

The student reported that the post-fix checks passed:

- Circular input is rejected with:
  TypeError: Circular children array detected.
- Reusing the same non-circular array produces both text children.

## Remaining audits

Two additional defects have not yet been confirmed.
Do not count hypothetical defects or deliberate connection failures.

## Audit 02 — Input Focus Loss After State Update

### Source

AI-generated code in Exercise 2 (`reactive-engine.ts`).

### Problem

The input field loses focus whenever the application state changes.

### Cause

The application replaces the entire interface after each state update, including the input element.

### Detection

Chrome DevTools showed:

- Before update: **true**
- After update: **false**

### Fix

Preserve or restore input focus when updating the interface instead of unnecessarily replacing the focused element.

### Verification

The error was reproduced successfully. Verification after fixing is still pending.

---

## Audit 03 — Old State Reused in a New Application

### Source

AI-generated code in Exercise 2 (`reactive-engine.ts` and `state-store.ts`).

### Problem

A new application incorrectly uses the previous application's state.

### Cause

The state storage is not cleared when mounting a new application.

### Detection

Chrome DevTools showed:

- App A: **FIRST**
- App B: **FIRST** (incorrect)

### Fix

Clear the previous state when mounting a new independent application.

### Verification

The error was reproduced successfully. After fixing, the expected results are:

- App A: **FIRST**
- App B: **SECOND**

The post-fix result still needs to be verified.

## HW2-04 — Constructor syntax incompatible with project configuration

- AI-generated code:
  `constructor(private readonly loader: AudioLoader) {}`
- Evidence: npm run build reported TS1294 at
  src/audio-queue-controller.ts:10:15 because erasableSyntaxOnly is enabled.
- Cause: the generated constructor used a TypeScript parameter property,
  which is not allowed under this configuration.
- Fix: declare the loader property explicitly and assign it in the constructor.
  Keep tsconfig.json unchanged.
- Verification: after the fix, npm run build completed successfully.
  The seven controlled-loader FIFO checks had passed before this syntax fix.

## HW2-10 — DevTools helper unavailable inside test callback

- Error: the AI-generated cleanup test called getEventListeners
  directly inside a button event callback.
- Evidence: Console reported
  "ReferenceError: getEventListeners is not defined"
  and the cleanup checks stopped before completion.
- Scope: this was a verification-script error, not evidence of
  a defect in audio-app.ts.
- Fix: capture the Console helper before the first await:
  const inspectListeners = getEventListeners;
  Then call inspectListeners(root) inside the callback.
- Verification: the corrected test completed with six PASS results:
  delegated listener installation, single AudioContext creation,
  repeated disposal, context closure and stale-update prevention,
  remount listener count, and final listener removal.

## HW3-A01 — Duplicate IDs introduced by the AI verification script

### Source

AI-generated DevTools scripts for controller lifecycle verification.
The scripts used cloneNode(true) on #main-content and appended the
clone to the same document, changing only the root ID.

### Observed failure and evidence

The student screenshot showed DevTools Issues reporting:
"Duplicate form field id in the same form", with two affected resources.

The cloned descendants retained the original input IDs.
The original page and the temporary test region therefore contained
duplicate IDs while the test region was attached.

### Impact

This was a verification-script defect, not an inventory-engine defect.
Duplicate IDs can make label associations and document-level element
lookups ambiguous and contaminate accessibility verification.

Passing lifecycle assertions did not establish valid document semantics.

### Correction

The temporary test region was removed by the script's finally block.
The student reloaded the page and ran a read-only duplicate-ID scan
without attaching another cloned region.

Future lifecycle tests must use an isolated document, such as an iframe,
or consistently rename IDs and their referencing attributes.
The previous clone-and-append scripts must not be reused unchanged.

### Actual verification

The student screenshot after reload showed:
"Duplicate ID count: 0".
DevTools also displayed "No issues".

This confirms that the clean application page had no duplicate IDs
at the time of that check.
A corrected lifecycle script kept the cloned root detached from the document.
The student screenshot confirmed four passing checks: simulation started,
no stale UI updates after disposal, action buttons remained disabled,
and the test root stayed detached while page IDs remained unique.
This verifies the corrected test setup and UI cleanup behavior;
it does not directly prove internal reservation cancellation or memory cleanup.

### HW3 audit progress

Two confirmed HW3 findings are documented below and above.
The requirement for at least three HW3 AI flaws is not yet satisfied.


## HW3-A02 — Accepted expiry timestamp rendered as Invalid Date

### Source

AI-generated expiry formatting in hw3/src/render-inventory.ts:
new Date(reservation.expiresAt).toLocaleTimeString('vi-VN').

### Reproduction

Create an engine with:
- now = Number.MAX_SAFE_INTEGER - 1000
- reservationTtlMs = 500
- saleEndsAt = Number.MAX_SAFE_INTEGER
- initialStock = 1

Reserve one item and render the snapshot into a detached test root.

### Observed failure

The student screenshot confirmed:
- reservationAccepted: true
- expiryIsSafeInteger: true
- expiryText displayed an Invalid Date value.

### Cause and impact

The renderer assumed that every safe-integer timestamp accepted by
the inventory contract could be formatted as a JavaScript Date.

The boundary input satisfied the engine contract, but the calendar
formatter could not represent it. The UI displayed an invalid expiry.
This is a boundary-formatting defect; stock corruption was not observed.
Ordinary current-date timestamps were not shown to be affected.

### Fix

Check expiryDate.getTime() before calendar formatting.
When the Date is invalid, display the numeric timestamp with an explicit
message that it is outside the calendar display range.
Preserve the inventory timestamp contract.

Fix commit: 8641290.

### Actual verification

The production build passed.
The student reran the detached boundary test and supplied a screenshot:
- reservationAccepted: true
- expiryIsSafeInteger: true
- passed: true

The passing assertion required the fallback message to appear and
Invalid Date to be absent.
Normal-date formatting regression checks remain pending.