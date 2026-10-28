import type {
  AudioLoader,
  AudioTask,
} from './audio-queue-contract';

export class AudioTaskQueue {
  private readonly queue: AudioTask[] = [];
  private isProcessing = false;

  private readonly loader: AudioLoader;

constructor(loader: AudioLoader) {
  this.loader = loader;
}

  enqueue(trackUrl: string): Promise<AudioBuffer> {
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

  private async processNext(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    const task = this.queue.shift();

    if (!task) {
      return;
    }

    this.isProcessing = true;

    try {
      const buffer = await this.loader(
        task.trackUrl,
        task.controller.signal,
      );

      task.resolve(buffer);
    } catch (error: unknown) {
      task.reject(
        error instanceof Error
          ? error
          : new Error('Audio task failed.'),
      );
    } finally {
      this.isProcessing = false;
      void this.processNext();
    }
  }
}