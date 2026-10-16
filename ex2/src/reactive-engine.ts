import { nextStateIndex, resetCursor, stateStore } from "./state-store";
import type {
  AppComponent,
  StateResult,
  StateSetter,
} from "./types";

let component: AppComponent | null = null;
let container: HTMLElement | null = null;
let isRendering = false;

export function renderApp(): void {
  if (!component || !container) {
    throw new Error("Call mountApp before rendering.");
  }

  if (isRendering) {
    throw new Error("Cannot update state during rendering.");
  }

  isRendering = true;

  try {
    resetCursor();
    const view = component();
    container.replaceChildren(view);
  } finally {
    isRendering = false;
  }
}

export function mountApp(
  app: AppComponent,
  root: HTMLElement
): void {
  component = app;
  container = root;
  renderApp();
}

export function useState<T>(initialValue: T): StateResult<T> {
  if (!isRendering) {
    throw new Error("useState must be called while rendering.");
  }

  const index = nextStateIndex();

  if (!Object.prototype.hasOwnProperty.call(stateStore, index)) {
    stateStore[index] = initialValue;
  }

  const setState: StateSetter<T> = (update) => {
    if (isRendering) {
      throw new Error("Cannot update state during rendering.");
    }

    const previous = stateStore[index] as T;
    const next = typeof update === "function"
      ? (update as (previous: T) => T)(previous)
      : update;

    if (Object.is(previous, next)) return;

    stateStore[index] = next;
    renderApp();
  };

  return [stateStore[index] as T, setState];
}