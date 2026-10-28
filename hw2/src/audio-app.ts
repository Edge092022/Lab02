import { AudioTaskQueue } from './audio-queue-controller';
import { createAudioLoader } from './audio-loader';
import { AudioPlayer } from './audio-player';
import { AudioAnalyser } from './audio-analyser';
import { AudioVisualizer } from './audio-visualizer';

type TaskState = 'queued' | 'processing' | 'done' | 'error' | 'cancelled';

interface TaskView {
  readonly url: string;
  readonly element: HTMLLIElement;
  state: TaskState;
}

interface Engine {
  readonly context: AudioContext;
  readonly queue: AudioTaskQueue;
  readonly player: AudioPlayer;
  readonly analyser: AudioAnalyser;
  readonly visualizer: AudioVisualizer;
}

export function mountAudioApplication(root: HTMLElement): () => void {
  function requireElement<T extends HTMLElement>(selector: string): T {
    const element = root.querySelector<T>(selector);

    if (!element) {
      throw new Error(`Missing application element: ${selector}`);
    }

    return element;
  }

  const input = requireElement<HTMLInputElement>('#track-url');
  const status = requireElement<HTMLParagraphElement>('#app-status');
  const list = requireElement<HTMLOListElement>('#task-list');
  const empty = requireElement<HTMLParagraphElement>('#queue-empty');
  const canvas = requireElement<HTMLCanvasElement>('#audio-canvas');

  const listeners = new AbortController();
  const tasks: TaskView[] = [];

  let engine: Engine | null = null;
  let isDisposed = false;
  let generation = 0;

  function setTask(
    task: TaskView,
    state: TaskState,
    message: string,
  ): void {
    task.state = state;
    task.element.textContent = `${task.url} — ${message}`;
  }

  function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Lỗi không xác định.';
  }

  function createEngine(): Engine {
    const context = new AudioContext();
    let analyser: AudioAnalyser | null = null;
    let player: AudioPlayer | null = null;
    let visualizer: AudioVisualizer | null = null;

    try {
      analyser = new AudioAnalyser(context, context.destination);
      player = new AudioPlayer(context, analyser.input);
      visualizer = new AudioVisualizer(
        canvas,
        () => analyser!.readFrequencyData(),
      );

      const load = createAudioLoader(context);
      const queue = new AudioTaskQueue((url, signal) => {
        const task = tasks.find(
          (item) => item.state === 'queued' && item.url === url,
        );

        if (task) {
          setTask(task, 'processing', 'Đang tải và giải mã');
        }

        return load(url, signal);
      });

      return { context, queue, player, analyser, visualizer };
    } catch (error: unknown) {
      visualizer?.dispose();
      player?.dispose();
      analyser?.dispose();
      void context.close().catch(console.error);
      throw error;
    }
  }

  function enqueueTrack(): void {
    const url = input.value.trim();

    if (!url) {
      status.textContent = 'Hãy nhập URL âm thanh.';
      input.focus();
      return;
    }

    // Accept relative paths as well as absolute HTTP(S) URLs.
    try {
      const parsed = new URL(url, document.baseURI);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Chỉ hỗ trợ đường dẫn HTTP hoặc HTTPS.');
      }
    } catch (error: unknown) {
      status.textContent = `URL không hợp lệ: ${errorMessage(error)}`;
      input.focus();
      return;
    }

    try {
      engine ??= createEngine();
    } catch (error: unknown) {
      status.textContent = `Không thể khởi tạo audio: ${errorMessage(error)}`;
      return;
    }

    const currentEngine = engine;
    const taskGeneration = generation;

    const element = document.createElement('li');
    const task: TaskView = { url, element, state: 'queued' };
    tasks.push(task);
    setTask(task, 'queued', 'Đang chờ');
    list.append(element);
    empty.hidden = true;

    // Call resume during the user interaction and handle rejection immediately.
    const resumed = currentEngine.context.resume().then(
      () => null,
      (error: unknown) => ({ error }),
    );

    status.textContent = 'Đã thêm tác vụ vào hàng đợi.';
    input.value = '';

    void currentEngine.queue.enqueue(url)
      .then(async (buffer) => {
        const resumeResult = await resumed;

        if (isDisposed || taskGeneration !== generation) {
          return;
        }

        if (resumeResult !== null) {
          throw resumeResult.error;
        }

        currentEngine.player.play(buffer);
        currentEngine.visualizer.start();

        setTask(task, 'done', 'Tải và giải mã xong; đã bắt đầu phát');
        status.textContent = `Đã bắt đầu phát: ${url}`;
      })
      .catch((error: unknown) => {
        if (isDisposed || taskGeneration !== generation) {
          return;
        }

        setTask(task, 'error', errorMessage(error));
        status.textContent = `Tác vụ thất bại: ${errorMessage(error)}`;
      });
  }

  function cancelAll(): void {
    generation += 1;
    engine?.queue.cancelAll();

    for (const task of tasks) {
      if (task.state === 'queued' || task.state === 'processing') {
        setTask(task, 'cancelled', 'Đã hủy');
      }
    }

    status.textContent = 'Đã hủy các tác vụ đang tải, giải mã hoặc chờ.';
  }

  root.addEventListener('click', (event: MouseEvent) => {
    if (isDisposed || !(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest<HTMLButtonElement>(
      'button[data-action]',
    );

    if (!button || !root.contains(button) || button.disabled) {
      return;
    }

    switch (button.dataset.action) {
      case 'enqueue':
        enqueueTrack();
        break;

      case 'cancel-all':
        cancelAll();
        break;

      case 'stop':
        engine?.player.stop();
        engine?.visualizer.stop();
        status.textContent =
          'Đã dừng phát. Các tác vụ tải và giải mã vẫn tiếp tục.';
        break;
    }
  }, { signal: listeners.signal });

  return () => {
    if (isDisposed) {
      return;
    }

    isDisposed = true;
    generation += 1;
    listeners.abort();

    if (engine) {
      engine.queue.dispose();
      engine.player.dispose();
      engine.visualizer.dispose();
      engine.analyser.dispose();
      void engine.context.close().catch(console.error);
      engine = null;
    }

    tasks.length = 0;
    list.replaceChildren();
    empty.hidden = false;
    status.textContent = 'Ứng dụng đã đóng.';
  };
}