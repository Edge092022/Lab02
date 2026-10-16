export type ActionHandler = (
  action: string,
  control: HTMLElement,
  event: Event
) => void;

const connections = new WeakMap<HTMLElement, AbortController>();

export function attachRootEvents(
  root: HTMLElement,
  handleAction: ActionHandler
): () => void {
  // Replace an earlier connection instead of duplicating listeners.
  connections.get(root)?.abort();

  const controller = new AbortController();
  connections.set(root, controller);

  const delegate = (event: Event): void => {
    if (!(event.target instanceof Element)) return;

    const control = event.target.closest<HTMLElement>("[data-action]");

    if (!control || !root.contains(control)) return;

    const expectedEvent = control.dataset.event ?? "click";
    if (event.type !== expectedEvent) return;

    const action = control.dataset.action;
    if (!action) return;

    if (event.type === "submit") {
      event.preventDefault();
    }

    handleAction(action, control, event);
  };

  for (const type of ["click", "change", "submit"]) {
    root.addEventListener(type, delegate, {
      signal: controller.signal,
    });
  }

  return () => {
    controller.abort();

    if (connections.get(root) === controller) {
      connections.delete(root);
    }
  };
}