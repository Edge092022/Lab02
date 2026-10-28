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
