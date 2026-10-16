import { createElement, renderToDOM } from "./mini-react";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Missing #app container.");
}

const scriptPayload = "<script>alert(1)</script>";
const imagePayload = "<img src=x onerror=alert(1)>";

const vApp = createElement(
  "main",
  { id: "root-view" },
  createElement(
    "header",
    { className: "hero" },
    createElement("h1", null, "Mini React Engine"),
    createElement("p", null, "Exercise 1 — VNode and DOM mounting")
  ),
  createElement(
    "section",
    { "aria-labelledby": "security-heading" },
    createElement("h2", { id: "security-heading" }, "XSS verification"),
    createElement("p", { id: "script-test" }, scriptPayload),
    createElement("p", { id: "image-test" }, imagePayload)
  ),
  createElement(
    "button",
    {
      type: "button",
      onClick: () => console.log("Ping"),
    },
    "Click"
  )
);

root.replaceChildren(renderToDOM(vApp));

// Repeat mounting to check that previous content is replaced.
root.replaceChildren(renderToDOM(vApp));

const checks = {
  "One mounted root": root.childNodes.length === 1,
  "Semantic main": root.firstElementChild?.tagName === "MAIN",
  "Expected element tree":
    Array.from(root.querySelectorAll("*"))
      .map((element) => element.tagName)
      .join(",") === "MAIN,HEADER,H1,P,SECTION,H2,P,P,BUTTON",
  "Script stays literal":
    root.querySelector("#script-test")?.textContent === scriptPayload,
  "Image stays literal":
    root.querySelector("#image-test")?.textContent === imagePayload,
  "No injected elements": root.querySelector("script, img") === null,
  "No div elements": root.querySelector("div") === null,
  "No inline handler": root.querySelector("[onclick], [onerror]") === null,
  "One heading level 1": root.querySelectorAll("h1").length === 1,
};

console.table(checks);

for (const [name, passed] of Object.entries(checks)) {
  console.assert(passed, name);
}

console.log("VNode tree:", vApp);

if (Object.values(checks).every(Boolean)) {
  console.log("PASS: Exercise 1 mounting and XSS checks.");
} else {
  console.error("FAIL: Inspect the checks above.");
}