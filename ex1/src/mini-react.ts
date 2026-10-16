import type {
  Child,
  ElementVNode,
  Props,
  TextVNode,
  VNode,
} from "./types";

export function createTextElement(value: string | number): TextVNode {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new TypeError("Text must be a string or number.");
  }

  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: String(value),
    },
    children: [],
  };
}
export function createElement(
  type: keyof HTMLElementTagNameMap,
  props: Props | null,
  ...children: Child[]
): ElementVNode {
  if (typeof type !== "string" || !/^[a-z][a-z0-9-]*$/.test(type)) {
    throw new TypeError("Invalid element type.");
  }

  if (
    props !== null &&
    (typeof props !== "object" || Array.isArray(props))
  ) {
    throw new TypeError("Props must be an object or null.");
  }

  const normalized: VNode[] = [];

  const appendChild = (child: Child): void => {
    if (Array.isArray(child)) {
      child.forEach(appendChild);
      return;
    }

    if (child === null || child === undefined || typeof child === "boolean") {
      return;
    }

    if (typeof child === "string" || typeof child === "number") {
      normalized.push(createTextElement(child));
      return;
    }

    if (
      typeof child === "object" &&
      typeof child.type === "string" &&
      child.props !== null &&
      typeof child.props === "object" &&
      Array.isArray(child.children)
    ) {
      normalized.push(child);
      return;
    }

    throw new TypeError("Invalid child.");
  };

  children.forEach(appendChild);

  return {
    type,
    props: { ...props },
    children: normalized,
  };
}