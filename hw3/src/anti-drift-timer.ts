export function createAntiDriftTimer(
  durationMs: number,
  onTick: (remaining: number) => void,
): () => void {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new RangeError('durationMs must be finite and non-negative.');
  }

  const targetTime = Date.now() + durationMs;

  if (!Number.isFinite(targetTime)) {
    throw new RangeError('Timer deadline must be finite.');
  }

  let rafId: number | null = null;
  let stopped = false;

  function cancel(): void {
    stopped = true;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function tick(): void {
    rafId = null;

    if (stopped) {
      return;
    }

    const remaining = Math.max(0, targetTime - Date.now());

    try {
      onTick(remaining);
    } catch (error) {
      cancel();
      throw error;
    }

    if (stopped) {
      return;
    }

    if (remaining === 0) {
      stopped = true;
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return cancel;
}