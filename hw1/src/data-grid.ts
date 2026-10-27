import type { DataGridProps } from "./data-grid-contract";

export function createDataGrid<T>(props: DataGridProps<T>): HTMLTableElement {
  const table = document.createElement("table");
  table.setAttribute("role", "grid");
  table.setAttribute("aria-label", props.ariaLabel);

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headerRow.setAttribute("role", "row");

  for (const column of props.columns) {
    const header = document.createElement("th");
    header.scope = "col";
    header.textContent = column.header;
    headerRow.appendChild(header);
  }

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  for (const item of props.data) {
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

  table.appendChild(tbody);
  return table;
}