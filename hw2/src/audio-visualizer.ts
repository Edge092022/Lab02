export interface AudioVisualizerContract {
  start(): void;
  stop(): void;
  dispose(): void;
}

export class AudioVisualizer implements AudioVisualizerContract {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly readFrequencyData: () => Uint8Array;

  private frameId: number | null = null;
  private isRunning = false;
  private isDisposed = false;

  constructor(
    canvas: HTMLCanvasElement,
    readFrequencyData: () => Uint8Array,
  ) {
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    this.canvas = canvas;
    this.context = context;
    this.readFrequencyData = readFrequencyData;
  }

  start(): void {
    if (this.isDisposed) {
      throw new Error('Audio visualizer is disposed.');
    }

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.scheduleFrame();
  }

  stop(): void {
    this.isRunning = false;

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    this.stop();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private scheduleFrame(): void {
    if (this.isRunning && this.frameId === null) {
      this.frameId = requestAnimationFrame(this.drawFrame);
    }
  }

  private readonly drawFrame = (): void => {
    this.frameId = null;

    if (!this.isRunning) {
      return;
    }

    try {
      this.drawBars(this.readFrequencyData());
    } catch (error: unknown) {
      this.stop();
      throw error;
    }

    this.scheduleFrame();
  };

  private drawBars(data: Uint8Array): void {
    const { width, height } = this.canvas;
    const context = this.context;

    context.fillStyle = '#111827';
    context.fillRect(0, 0, width, height);

    if (data.length === 0) {
      return;
    }

    const barWidth = width / data.length;

    context.fillStyle = '#38bdf8';

    for (let index = 0; index < data.length; index += 1) {
      const value = data[index] ?? 0;
      const barHeight = (value / 255) * height;

      context.fillRect(
        index * barWidth,
        height - barHeight,
        barWidth,
        barHeight,
      );
    }
  }
}