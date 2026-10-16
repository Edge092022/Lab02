import { mountApp, useState } from "./reactive-engine";
import { attachRootEvents } from "./events";
import type { StateSetter, Task, TaskFilter } from "./types";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Missing #app.");
}

let updateTasks: StateSetter<Task[]>;
let updateFilter: StateSetter<TaskFilter>;

function TaskApp(): HTMLElement {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "task-1", title: "Review PR", completed: false },
    { id: "task-2", title: "Verify AST", completed: true },
  ]);
  const [filter, setFilter] = useState<TaskFilter>("ALL");

  updateTasks = setTasks;
  updateFilter = setFilter;

  const main = document.createElement("main");

  const heading = document.createElement("h1");
  heading.textContent = "Reactive Task Manager";

  const summary = document.createElement("p");
  summary.setAttribute("role", "status");
  summary.textContent =
    `Tasks: ${tasks.length} | Completed: ${
      tasks.filter(task => task.completed).length
    }`;

  const form = document.createElement("form");
  form.dataset.action = "add";
  form.dataset.event = "submit";

  const label = document.createElement("label");
  label.htmlFor = "task-title";
  label.textContent = "New task ";

  const input = document.createElement("input");
  input.id = "task-title";
  input.name = "title";
  input.type = "text";
  input.required = true;
  input.maxLength = 200;

  const add = document.createElement("button");
  add.type = "submit";
  add.textContent = "Add Task";

  form.append(label, input, add);

  const filters = document.createElement("nav");
  filters.setAttribute("aria-label", "Task filters");

  const choices: TaskFilter[] = ["ALL", "ACTIVE", "COMPLETED"];

  for (const choice of choices) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = `filter-${choice}`;
    button.textContent = choice;
    button.dataset.action = "filter";
    button.dataset.filter = choice;
    button.setAttribute("aria-pressed", String(filter === choice));
    filters.append(button);
  }

  const section = document.createElement("section");
  section.setAttribute("aria-labelledby", "tasks-heading");

  const listHeading = document.createElement("h2");
  listHeading.id = "tasks-heading";
  listHeading.textContent = `${filter} tasks`;

  const list = document.createElement("ul");
  list.id = "task-list";

  const visible = tasks.filter(task =>
    filter === "ALL" ||
    (filter === "ACTIVE" && !task.completed) ||
    (filter === "COMPLETED" && task.completed)
  );

  for (const task of visible) {
    const item = document.createElement("li");

    const taskLabel = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = task.id;
    checkbox.checked = task.completed;
    checkbox.dataset.action = "toggle";
    checkbox.dataset.event = "change";
    checkbox.dataset.id = task.id;

    taskLabel.append(
      checkbox,
      document.createTextNode(` ${task.title}`)
    );

    item.append(taskLabel);
    list.append(item);
  }

  section.append(listHeading, list);

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No tasks in this filter.";
    section.append(empty);
  }

  main.append(heading, summary, form, filters, section);
  return main;
}

mountApp(TaskApp, root);

const disconnect = attachRootEvents(root, (action, control) => {
  if (action === "add" && control instanceof HTMLFormElement) {
    const title = String(new FormData(control).get("title") ?? "").trim();
    if (!title) return;

    updateTasks(previous => [
      ...previous,
      {
        id: `task-${crypto.randomUUID()}`,
        title,
        completed: false,
      },
    ]);

    root.querySelector<HTMLInputElement>("#task-title")?.focus();
  }

  if (action === "toggle" && control instanceof HTMLInputElement) {
    const id = control.dataset.id;
    const completed = control.checked;

    updateTasks(previous =>
      previous.map(task =>
        task.id === id ? { ...task, completed } : task
      )
    );

    if (id) document.getElementById(id)?.focus();
  }

  if (action === "filter") {
    const filter = control.dataset.filter;

    if (
      filter === "ALL" ||
      filter === "ACTIVE" ||
      filter === "COMPLETED"
    ) {
      updateFilter(filter);
      document.getElementById(`filter-${filter}`)?.focus();
    }
  }
});

// Clean up the connection during Vite hot reload.
if (import.meta.hot) {
  import.meta.hot.dispose(disconnect);
}