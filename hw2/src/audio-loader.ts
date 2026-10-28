import type { AudioLoader } from './audio-queue-contract';

function assertNotAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new DOMException('Audio loading was cancelled.', 'AbortError');
  }
}

export function createAudioLoader(
  context: AudioContext,
): AudioLoader {
  return async (trackUrl, signal) => {
    assertNotAborted(signal);

    if (trackUrl.trim().length === 0) {
      throw new TypeError('Track URL must not be blank.');
    }

    try {
      const response = await fetch(trackUrl, { signal });

      if (!response.ok) {
        throw new Error(`Audio download failed: HTTP ${response.status}.`);
      }

      const data = await response.arrayBuffer();
      assertNotAborted(signal);

      const buffer = await context.decodeAudioData(data);
      assertNotAborted(signal);

      return buffer;
    } catch (error: unknown) {
      // Normalize cancellation even if another operation also failed.
      assertNotAborted(signal);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Audio loading failed.');
    }
  };
}