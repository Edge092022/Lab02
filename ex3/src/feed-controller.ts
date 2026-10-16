import type {
  FeedController,
  FetchFeed,
  Item,
  ViewState,
} from "./types";

export function createFeedController(
  fetchFeed: FetchFeed,
  onChange: (state: ViewState<Item[]>) => void
): FeedController {
  let state: ViewState<Item[]> = { status: "IDLE" };

  const load = async (): Promise<void> => {
    // Only initial loading and retry are allowed.
    if (state.status !== "IDLE" && state.status !== "ERROR") {
      return;
    }

    state = { status: "LOADING" };
    onChange(state);

    try {
      const data = await fetchFeed();
      state = { status: "SUCCESS", data };
    } catch (error: unknown) {
      state = {
        status: "ERROR",
        error: error instanceof Error
          ? error.message
          : "Unable to load data. Please try again.",
      };
    }

    onChange(state);
  };

  return {
    getState: () => state,
    load,
  };
}