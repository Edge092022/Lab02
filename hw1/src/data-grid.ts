import { filterRows } from "./filter-rows";
import type { DataGridProps } from "./data-grid-contract";
import { sortRows } from "./sort-rows";
import { paginateRows } from "./paginate-rows";

export function createDataGrid<T>(
  props: DataGridProps<T>,
  searchInput: HTMLInputElement,
  pagination: {
    previous: HTMLButtonElement;
    next: HTMLButtonElement;
    status: HTMLElement;
  },
): HTMLTableElement {
  const table = document.createElement("table");
  table.setAttribute("role", "grid");
  table.setAttribute("aria-label", props.ariaLabel);

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.setAttribute("role", "row");

  const tbody = document.createElement("tbody");
  const rowItems = new WeakMap<HTMLTableRowElement, T>();
  const selectedItems = new Set<T>();

  let activeColumn: number | null = null;
  let direction: "ascending" | "descending" = "ascending";
  let currentPage = 1;
  const pageSize = 2;

  function renderRows(rows: T[]): void {
    tbody.replaceChildren();

    for (const item of rows) {
      const row = document.createElement("tr");
      row.setAttribute("role", "row");
      rowItems.set(row, item);
      row.setAttribute("aria-selected", String(selectedItems.has(item)));

      for (const column of props.columns) {
        const cell = document.createElement("td");
        cell.tabIndex = -1;
        cell.setAttribute("role", "gridcell");
        cell.textContent = String(item[column.accessorKey] ?? "");
        row.appendChild(cell);
      }

      tbody.appendChild(row);
    }

    const firstCell = tbody.querySelector<HTMLTableCellElement>(
      '[role="gridcell"]',
    );

    if (firstCell) {
      firstCell.tabIndex = 0;
    }
  }

  tbody.addEventListener("keydown", (event) => {
    const currentCell = event.target;

    if (
      !(currentCell instanceof HTMLTableCellElement) ||
      currentCell.getAttribute("role") !== "gridcell"
    ) {
      return;
    }

    const currentRow = currentCell.parentElement;

    if (!(currentRow instanceof HTMLTableRowElement)) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
  event.preventDefault();

  if (!rowItems.has(currentRow)) return;
  const item = rowItems.get(currentRow) as T;

  const shouldSelect =
    event.key === "Enter" || !selectedItems.has(item);

  selectedItems.clear();

  if (shouldSelect) {
    selectedItems.add(item);
  }

  for (const row of Array.from(tbody.rows)) {
    const rowItem = rowItems.get(row) as T;
    row.setAttribute(
      "aria-selected",
      String(selectedItems.has(rowItem)),
    );
  }

  if (event.key === "Enter") {
    props.onRowSelect?.(item);
  }

  return;
}

    const rows = Array.from(tbody.rows);
    const rowIndex = rows.indexOf(currentRow);
    const columnIndex = currentCell.cellIndex;

    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    switch (event.key) {
      case "ArrowUp":
        nextRow -= 1;
        break;
      case "ArrowDown":
        nextRow += 1;
        break;
      case "ArrowLeft":
        nextColumn -= 1;
        break;
      case "ArrowRight":
        nextColumn += 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextCell = rows[nextRow]?.cells[nextColumn];

    if (!nextCell) {
      return;
    }

    currentCell.tabIndex = -1;
    nextCell.tabIndex = 0;
    nextCell.focus();
  });

  function updateRows(): void {
    let rows = filterRows(props.data, props.columns, searchInput.value);

    if (activeColumn !== null) {
      const column = props.columns[activeColumn];
      rows = sortRows(rows, column.accessorKey, direction);
    }

    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);

    renderRows(paginateRows(rows, currentPage, pageSize));

    pagination.status.textContent = `Page ${currentPage} of ${totalPages}`;
    pagination.previous.disabled = currentPage === 1;
    pagination.next.disabled = currentPage === totalPages;
  }

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    updateRows();
  });

  pagination.previous.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      updateRows();
    }
  });

  pagination.next.addEventListener("click", () => {
    currentPage += 1;
    updateRows();
  });

  props.columns.forEach((column, index) => {
    const header = document.createElement("th");
    header.scope = "col";

    if (column.sortable) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = column.header;
      button.dataset.columnIndex = String(index);
      header.appendChild(button);
    } else {
      header.textContent = column.header;
    }

    headerRow.appendChild(header);
  });

  thead.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const index = Number(target.dataset.columnIndex);
    const column = props.columns[index];

    if (!column || !column.sortable) {
      return;
    }

    direction =
      activeColumn === index && direction === "ascending"
        ? "descending"
        : "ascending";

    activeColumn = index;

    for (const header of headerRow.cells) {
      header.removeAttribute("aria-sort");
    }

    headerRow.cells[index].setAttribute("aria-sort", direction);
    updateRows();
  });

  thead.appendChild(headerRow);
  table.append(thead, tbody);
  updateRows();

  return table;
}