export interface AudioAnalyserContract {
  readonly input: AudioNode;
  readonly fftSize: number;
  readonly frequencyBinCount: number;
  readFrequencyData(): Uint8Array;
  dispose(): void;
}

export class AudioAnalyser implements AudioAnalyserContract {
  private readonly analyser: AnalyserNode;
  private readonly frequencyData = new Uint8Array(256);
  private isDisposed = false;

  constructor(context: AudioContext, output: AudioNode) {
    if (output.context !== context) {
      throw new Error('Output must belong to the supplied AudioContext.');
    }

    const analyser = context.createAnalyser();
    analyser.fftSize = 512;

    try {
      analyser.connect(output);
    } catch (error: unknown) {
      analyser.disconnect();
      throw error;
    }

    this.analyser = analyser;
  }

  get input(): AudioNode {
    return this.analyser;
  }

  get fftSize(): number {
    return this.analyser.fftSize;
  }

  get frequencyBinCount(): number {
    return this.analyser.frequencyBinCount;
  }

  readFrequencyData(): Uint8Array {
    if (this.isDisposed) {
      throw new Error('Audio analyser is disposed.');
    }

    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    this.analyser.disconnect();
    this.frequencyData.fill(0);
  }
}