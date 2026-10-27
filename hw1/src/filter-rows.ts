import type { ColumnDef } from "./data-grid-contract";

export function filterRows<T>(
  rows: T[],
  columns: ColumnDef<T>[],
  query: string,
): T[] {
  const keyword = query.trim().toLocaleLowerCase();

  return rows.filter((row) =>
    columns.some((column) => {
      const value = String(row[column.accessorKey] ?? "");
      return value.toLocaleLowerCase().includes(keyword);
    }),
  );
}