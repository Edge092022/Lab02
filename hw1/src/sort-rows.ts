export function sortRows<T>(
  rows: T[],
  key: keyof T,
  direction: "ascending" | "descending",
): T[] {
  const sortedRows = [...rows];

  sortedRows.sort((first, second) => {
    const firstValue = first[key];
    const secondValue = second[key];

    let comparison: number;

    if (typeof firstValue === "number" && typeof secondValue === "number") {
      comparison = firstValue - secondValue;
    } else {
      comparison = String(firstValue ?? "").localeCompare(
        String(secondValue ?? ""),
        undefined,
        { numeric: true, sensitivity: "base" },
      );
    }

    return direction === "ascending" ? comparison : -comparison;
  });

  return sortedRows;
}