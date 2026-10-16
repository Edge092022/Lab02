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

| Task | Check | Actual result |
| --- | --- | --- |
| E1-02 | Text VNode factory | Pending |
| E1-03 | Element factory and child normalization | Pending |
| E1-04 | Recursive rendering and typeguards | Pending |
| E1-05 | XSS and DevTools audit | Pending |

## AI Failure Audit

No confirmed AI failures recorded yet.
Only document failures with actual evidence and fixes.