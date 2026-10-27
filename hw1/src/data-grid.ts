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

  let activeColumn: number | null = null;
  let direction: "ascending" | "descending" = "ascending";
  let currentPage = 1;
const pageSize = 2;

  function renderRows(rows: T[]): void {
    tbody.replaceChildren();

    for (const item of rows) {
      const row = document.createElement("tr");
      row.setAttribute("role", "row");

      for (const column of props.columns) {
        const cell = document.createElement("td");
        cell.setAttribute("role", "gridcell");
        cell.textContent = String(item[column.accessorKey] ?? "");
        row.appendChild(cell);
      }

      tbody.appendChild(row);
    }
  }

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

    if (!(target instanceof HTMLButtonElement)) return;

    const index = Number(target.dataset.columnIndex);
    const column = props.columns[index];

    if (!column || !column.sortable) return;

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