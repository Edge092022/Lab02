/**
 * Downloads and decodes one audio track.
 *
 * Reject on HTTP, network, decoding, or cancellation errors.
 * Audio decoding cannot be interrupted directly:
 * check the signal before decoding and after decoding finishes.
 * Do not return a buffer if the signal has been aborted.
 */
export type AudioLoader = (
  trackUrl: string,
  signal: AbortSignal,
) => Promise<AudioBuffer>;

/**
 * Internal record owned by the queue.
 * Each task has its own cancellation controller.
 */
export interface AudioTask {
  readonly trackUrl: string;
  readonly controller: AbortController;
  readonly resolve: (buffer: AudioBuffer) => void;
  readonly reject: (reason: Error) => void;
}

/**
 * Public queue API.
 *
 * Scheduling:
 * - Accept multiple enqueue calls.
 * - Process at most one loader invocation at a time.
 * - Start tasks in their enqueue order.
 * - Continue after a task succeeds, fails, or is cancelled.
 *
 * Promise settlement:
 * - Settle every accepted task exactly once.
 * - Cancellation rejects with an Error named "AbortError".
 * - Never deliver a cancelled task's buffer to its caller.
 */
export interface AudioTaskQueueContract {
  /**
   * Enqueue one track without starting playback.
   *
   * Reject a blank URL with TypeError.
   * Reject calls made after disposal with an Error.
   * Invalid calls must not create queue entries.
   */
  enqueue(trackUrl: string): Promise<AudioBuffer>;

  /**
   * Cancel all tasks accepted before this call.
   *
   * Reject their promises without waiting for an active decode to finish.
   * Allow new tasks to be enqueued after this call.
   * Wait for the old loader invocation to settle before starting a new one.
   * Calling this on an empty or disposed queue is a no-op.
   */
  cancelAll(): void;

  /**
   * Permanently close the queue and cancel all outstanding tasks.
   *
   * Repeated calls are safe.
   * Do not close the externally owned AudioContext.
   */
  dispose(): void;
}