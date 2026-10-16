export interface Item {
  id: number;
  title: string;
}

export type ViewState<T> =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "SUCCESS"; data: T }
  | { status: "ERROR"; error: string };

export type FetchFeed = () => Promise<Item[]>;

export interface FeedController {
  getState(): ViewState<Item[]>;
  load(): Promise<void>;
}