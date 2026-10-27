import { createDataGrid } from "./data-grid";
import type { ColumnDef } from "./data-grid-contract";

interface Student {
  id: number;
  name: string;
  major: string;
}

const students: Student[] = [
  { id: 1, name: "An", major: "Information Technology" },
  { id: 2, name: "Binh", major: "Information Systems" },
  { id: 3, name: "Chi", major: "Computer Science" },
];

const columns: ColumnDef<Student>[] = [
  { header: "ID", accessorKey: "id", sortable: true },
  { header: "Name", accessorKey: "name", sortable: true },
  { header: "Major", accessorKey: "major", sortable: true },
];

const heading = document.createElement("h1");
heading.textContent = "Student Data Grid";

const searchLabel = document.createElement("label");
searchLabel.htmlFor = "grid-search";
searchLabel.textContent = "Search students: ";

const searchInput = document.createElement("input");
searchInput.id = "grid-search";
searchInput.type = "search";
const previousButton = document.createElement("button");
previousButton.type = "button";
previousButton.textContent = "Previous";

const nextButton = document.createElement("button");
nextButton.type = "button";
nextButton.textContent = "Next";

const pageStatus = document.createElement("span");
pageStatus.setAttribute("aria-live", "polite");

const grid = createDataGrid<Student>(
  {
    data: students,
    columns,
    ariaLabel: "Student data grid",
    onRowSelect: (student) => {
  console.log("Selected student:", student);
},
  },
  searchInput,
   {
    previous: previousButton,
    next: nextButton,
    status: pageStatus,
  },
);


const main = document.createElement("main");
main.append(
  heading,
  searchLabel,
  searchInput,
  grid,
  previousButton,
  pageStatus,
  nextButton,
);

document.body.replaceChildren(main);