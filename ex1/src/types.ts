export type EventHandler = (event: Event) => void;

export type PropValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | EventHandler;

export interface Props {
  [name: string]: PropValue;
}

export interface TextVNode {
  type: "TEXT_ELEMENT";
  props: {
    nodeValue: string;
  };
  children: [];
}

export interface ElementVNode {
  type: keyof HTMLElementTagNameMap;
  props: Props;
  children: VNode[];
}

export type VNode = TextVNode | ElementVNode;

export type Child =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[];