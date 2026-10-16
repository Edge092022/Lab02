export const stateStore: unknown[] = [];

let cursor = 0;

export function resetCursor(): void {
  cursor = 0;
}

export function nextStateIndex(): number {
  const index = cursor;
  cursor += 1;
  return index;
}