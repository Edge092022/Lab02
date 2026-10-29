import type {
  InventoryEngine,
  ReservationResult,
} from './inventory-contract';

export type SimulatedPurchase =
  | {
      readonly status: 'completed';
      readonly requestId: string;
      readonly result: ReservationResult;
    }
  | {
      readonly status: 'cancelled';
      readonly requestId: string;
    }
  | {
      readonly status: 'error';
      readonly requestId: string;
      readonly message: string;
    };

export interface SimulationSummary {
  readonly requested: number;
  readonly accepted: number;
  readonly rejected: number;
  readonly cancelled: number;
  readonly errors: number;
  readonly outcomes: readonly SimulatedPurchase[];
}

export async function simulatePurchases(
  engine: InventoryEngine,
  requestCount: number,
  signal: AbortSignal,
): Promise<SimulationSummary> {
  if (
    !Number.isSafeInteger(requestCount) ||
    requestCount < 1 ||
    requestCount > 1000
  ) {
    throw new RangeError('Request count must be an integer from 1 to 1000.');
  }

  const runId = crypto.randomUUID();
  const tasks: Promise<SimulatedPurchase>[] = [];

  for (let index = 0; index < requestCount; index++) {
    const requestId = `simulation:${runId}:${index}`;

    tasks.push(
      Promise.resolve().then((): SimulatedPurchase => {
        if (signal.aborted) {
          return { status: 'cancelled', requestId };
        }

        try {
          const result = engine.reserve({
            requestId,
            quantity: 1,
          });

          return {
            status: 'completed',
            requestId,
            result,
          };
        } catch (error) {
          return {
            status: 'error',
            requestId,
            message:
              error instanceof Error
                ? error.message
                : 'Unexpected simulation error.',
          };
        }
      }),
    );
  }

  const outcomes = await Promise.all(tasks);

  let accepted = 0;
  let rejected = 0;
  let cancelled = 0;
  let errors = 0;

  for (const outcome of outcomes) {
    if (outcome.status === 'cancelled') {
      cancelled++;
    } else if (outcome.status === 'error') {
      errors++;
    } else if (
      outcome.result.ok &&
      outcome.result.reservation.state === 'RESERVED'
    ) {
      accepted++;
    } else {
      rejected++;
    }
  }

  return {
    requested: requestCount,
    accepted,
    rejected,
    cancelled,
    errors,
    outcomes,
  };
}