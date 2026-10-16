import "./style.css";
import { createFeedController } from "./feed-controller";
import type { Item, ViewState } from "./types";

const app = document.getElementById("app");
const status = document.getElementById("status");

if (!app || !status) {
  throw new Error("Missing application containers.");
}

const root = app;
const statusLine = status;

async function fetchFeed(): Promise<Item[]> {
  // Brief demo delay makes the loading skeleton visible.
  await new Promise<void>(resolve => setTimeout(resolve, 800));

  let response: Response;

  try {
    response = await fetch("/feed.json", { cache: "no-store" });
  } catch {
    throw new Error("Unable to connect. Check your connection and retry.");
  }

  if (!response.ok) {
    throw new Error(`Unable to load data (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();

  if (
    !Array.isArray(data) ||
    !data.every(item =>
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "number" &&
      typeof item.title === "string"
    )
  ) {
    throw new Error("The server returned an invalid data format.");
  }

  return data as Item[];
}

function render(state: ViewState<Item[]>): void {
  root.dataset.state = state.status;
  root.setAttribute("aria-busy", String(state.status === "LOADING"));
  root.replaceChildren();

  statusLine.textContent = {
    IDLE: "Ready to load.",
    LOADING: "Loading data…",
    SUCCESS: "Data loaded successfully.",
    ERROR: "Loading failed.",
  }[state.status];

  const heading = document.createElement("h2");
  heading.textContent = state.status;
  heading.tabIndex = -1;
  root.append(heading);

  if (state.status === "IDLE" || state.status === "ERROR") {
    if (state.status === "ERROR") {
      const message = document.createElement("p");
      message.setAttribute("role", "alert");
      message.textContent = state.error;
      root.append(message);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = "load";
    button.textContent =
      state.status === "ERROR" ? "Retry Connection" : "Load Data";

    root.append(button);

    if (state.status === "ERROR") button.focus();
  }

  if (state.status === "LOADING") {
    for (let index = 0; index < 3; index += 1) {
      const skeleton = document.createElement("p");
      skeleton.className = "skeleton";
      skeleton.setAttribute("aria-hidden", "true");
      root.append(skeleton);
    }

    heading.focus();
  }

  if (state.status === "SUCCESS") {
    const list = document.createElement("ul");

    for (const item of state.data) {
      const row = document.createElement("li");
      row.textContent = item.title;
      list.append(row);
    }

    root.append(list);
    heading.focus();
  }
}

const controller = createFeedController(fetchFeed, render);

// One listener on the persistent root.
const events = new AbortController();

root.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest<HTMLButtonElement>(
    'button[data-action="load"]'
  );

  if (button && root.contains(button)) {
    void controller.load();
  }
}, { signal: events.signal });

render(controller.getState());

if (import.meta.hot) {
  import.meta.hot.dispose(() => events.abort());
}