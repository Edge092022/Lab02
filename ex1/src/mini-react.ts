
import type {
  Child,
  ElementVNode,
  Props,
  TextVNode,
  VNode,
} from "./types";

// 1. Create text VNode
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

// 2. Create element VNode
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
  const activeArrays = new WeakSet<Child[]>();

  const appendChild = (child: Child): void => {
    if (Array.isArray(child)) {
      if (activeArrays.has(child)) {
        throw new TypeError("Circular children array detected.");
      }

      activeArrays.add(child);

      try {
        child.forEach(appendChild);
      } finally {
        activeArrays.delete(child);
      }

      return;
    }

    if (
      child === null ||
      child === undefined ||
      typeof child === "boolean"
    ) {
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

// 3. Convert VNode to real DOM
export function renderToDOM(vnode: unknown): Node {
  const handlers = new WeakMap<
    HTMLElement,
    Map<string, (event: Event) => void>
  >();

  const eventTypes = new Set<string>();

  const build = (input: unknown): Node => {
    if (typeof input !== "object" || input === null) {
      throw new TypeError("VNode must be an object.");
    }

    const node = input as Record<string, unknown>;

    if (
      typeof node.props !== "object" ||
      node.props === null ||
      Array.isArray(node.props) ||
      !Array.isArray(node.children)
    ) {
      throw new TypeError("Invalid VNode props or children.");
    }

    const props = node.props as Record<string, unknown>;

    // Handle text nodes safely
    if (node.type === "TEXT_ELEMENT") {
      if (
        typeof props.nodeValue !== "string" ||
        node.children.length !== 0
      ) {
        throw new TypeError("Invalid text VNode.");
      }

      return document.createTextNode(props.nodeValue);
    }

    // Supported semantic HTML tags
    const tags = new Set([
      "main", "section", "header", "footer", "nav", "article",
      "h1", "h2", "h3", "p", "span", "strong", "em",
      "ul", "ol", "li", "button", "form", "label", "input",
      "select", "option",
    ]);

    if (typeof node.type !== "string" || !tags.has(node.type)) {
      throw new TypeError("Unsupported element type.");
    }

    const element = document.createElement(node.type);

    // Apply props and register event handlers
    for (const [name, value] of Object.entries(props)) {
      if (name === "key") continue;

      if (/^on/i.test(name)) {
        if (
          !/^on[A-Z][a-zA-Z]*$/.test(name) ||
          typeof value !== "function"
        ) {
          throw new TypeError("Event props must contain functions.");
        }

        const eventType = name.slice(2).toLowerCase();

        const events = handlers.get(element) ?? new Map();
        events.set(eventType, value as (event: Event) => void);

        handlers.set(element, events);
        eventTypes.add(eventType);

        continue;
      }

      const attribute =
        name === "className"
          ? "class"
          : name === "htmlFor"
            ? "for"
            : name;

      const allowed =
        /^(id|class|role|title|type|name|value|for|tabindex|disabled|checked|placeholder)$/.test(attribute) ||
        /^(aria|data)-[a-z0-9-]+$/.test(attribute);

      if (!allowed) {
        throw new TypeError(`Unsupported prop: ${name}`);
      }

      if (value === null || value === undefined) continue;

      if (!["string", "number", "boolean"].includes(typeof value)) {
        throw new TypeError(`Invalid value for prop: ${name}`);
      }

      if (attribute === "disabled" || attribute === "checked") {
        if (typeof value !== "boolean") {
          throw new TypeError(`${attribute} must be boolean.`);
        }

        if (value) {
          element.setAttribute(attribute, "");
        }
      } else {
        element.setAttribute(attribute, String(value));
      }
    }

    // Recursively render children
    for (const child of node.children) {
      element.appendChild(build(child));
    }

    return element;
  };

  const root = build(vnode);

  // Event delegation at the rendered root
  for (const eventType of eventTypes) {
    root.addEventListener(eventType, (event) => {
      let target =
        event.target instanceof Element ? event.target : null;

      while (target !== null) {
        if (target instanceof HTMLElement) {
          handlers.get(target)?.get(eventType)?.(event);
        }

        if (event.cancelBubble || target === root) {
          break;
        }

        target = target.parentElement;
      }
    });
  }

  return root;
}
