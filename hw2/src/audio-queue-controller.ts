import type {
  AudioLoader,
  AudioTask,
  AudioTaskQueueContract,
} from './audio-queue-contract';

export class AudioTaskQueue implements AudioTaskQueueContract {
  private readonly queue: AudioTask[] = [];
  private readonly loader: AudioLoader;

  private isProcessing = false;
  private isDisposed = false;
  private activeTask: AudioTask | null = null;

  constructor(loader: AudioLoader) {
    this.loader = loader;
  }

  enqueue(trackUrl: string): Promise<AudioBuffer> {
    if (this.isDisposed) {
      return Promise.reject(new Error('Audio queue is disposed.'));
    }

    if (trackUrl.trim().length === 0) {
      return Promise.reject(
        new TypeError('Track URL must not be blank.'),
      );
    }

    return new Promise<AudioBuffer>((resolve, reject) => {
      this.queue.push({
        trackUrl,
        controller: new AbortController(),
        resolve,
        reject,
      });

      void this.processNext();
    });
  }

  cancelAll(): void {
    // Remove waiting tasks before triggering any abort callbacks.
    const waitingTasks = this.queue.splice(0);
    const activeTask = this.activeTask;

    for (const task of waitingTasks) {
      this.cancelTask(task);
    }

    if (activeTask) {
      this.cancelTask(activeTask);
    }

    // Keep the processing lock until the active loader settles.
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    this.cancelAll();
  }

  private cancelTask(task: AudioTask): void {
    if (task.controller.signal.aborted) {
      return;
    }

    task.reject(
      new DOMException('Audio task was cancelled.', 'AbortError'),
    );
    task.controller.abort();
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.isDisposed) {
      return;
    }

    const task = this.queue.shift();

    if (!task) {
      return;
    }

    this.isProcessing = true;
    this.activeTask = task;

    try {
      const buffer = await this.loader(
        task.trackUrl,
        task.controller.signal,
      );

      if (!task.controller.signal.aborted) {
        task.resolve(buffer);
      }
    } catch (error: unknown) {
      if (!task.controller.signal.aborted) {
        task.reject(
          error instanceof Error
            ? error
            : new Error('Audio task failed.'),
        );
      }
    } finally {
      this.activeTask = null;
      this.isProcessing = false;
      void this.processNext();
    }
  }
}