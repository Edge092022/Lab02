export interface AudioPlayerContract {
  readonly isPlaying: boolean;
  play(buffer: AudioBuffer): void;
  stop(): void;
  dispose(): void;
}

export class AudioPlayer implements AudioPlayerContract {
  private readonly context: AudioContext;
  private readonly output: AudioNode;

  private source: AudioBufferSourceNode | null = null;
  private isDisposed = false;

  constructor(context: AudioContext, output: AudioNode) {
    if (output.context !== context) {
      throw new Error('Output must belong to the supplied AudioContext.');
    }

    this.context = context;
    this.output = output;
  }

  get isPlaying(): boolean {
    return this.source !== null;
  }

  play(buffer: AudioBuffer): void {
    if (this.isDisposed) {
      throw new Error('Audio player is disposed.');
    }

    if (this.context.state !== 'running') {
      throw new Error('AudioContext must be running before playback.');
    }

    this.stop();

    const source = this.context.createBufferSource();

    try {
      source.buffer = buffer;

      source.onended = () => {
        this.releaseSource(source);
      };

      source.connect(this.output);
      this.source = source;
      source.start();
    } catch (error: unknown) {
      this.releaseSource(source);
      throw error;
    }
  }

  stop(): void {
    const source = this.source;

    if (!source) {
      return;
    }

    // Remove the handler before stopping to avoid deferred cleanup callbacks.
    source.onended = null;

    try {
      source.stop();
    } finally {
      this.releaseSource(source);
    }
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    this.stop();
  }

  private releaseSource(source: AudioBufferSourceNode): void {
    source.onended = null;
    source.disconnect();
    source.buffer = null;

    if (this.source === source) {
      this.source = null;
    }
  }
}
