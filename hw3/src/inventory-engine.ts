import type {
  InventoryEngine,
  InventoryOptions,
  InventorySnapshot,
} from './inventory-contract';
import { reserveInventory } from './reserve-inventory';
import { expireReservations } from './expire-reservations';
import { checkoutReservation } from './checkout-reservation';

export function createInventoryEngine(
  options: InventoryOptions,
): InventoryEngine {
  // Copy configuration so external changes cannot alter engine behavior.
  const config = { ...options };

  if (
    !Number.isSafeInteger(config.initialStock) ||
    config.initialStock < 0 ||
    !Number.isSafeInteger(config.reservationTtlMs) ||
    config.reservationTtlMs <= 0 ||
    !Number.isSafeInteger(config.saleEndsAt) ||
    config.saleEndsAt < 0
  ) {
    throw new RangeError('Invalid inventory configuration.');
  }

  if (config.now !== undefined && typeof config.now !== 'function') {
    throw new TypeError('now must be a function.');
  }

  const clock = config.now ?? Date.now;
  let disposed = false;

  let snapshot: InventorySnapshot = {
    initialStock: config.initialStock,
    availableStock: config.initialStock,
    reservedStock: 0,
    soldStock: 0,
    reservations: [],
  };

  function readTime(): number {
    if (disposed) {
      throw new Error('Inventory engine has been disposed.');
    }

    const time = clock();

    if (!Number.isSafeInteger(time) || time < 0) {
      throw new RangeError('Invalid clock timestamp.');
    }

    return time;
  }

  function reconcile(time: number): number {
    const outcome = expireReservations(snapshot, time);
    snapshot = outcome.snapshot;
    return outcome.expiredCount;
  }

  // Validate the injected clock during initialization.
  readTime();

  return {
    reserve(input) {
      const time = readTime();
      reconcile(time);

      const outcome = reserveInventory(
        snapshot,
        input,
        config,
        time,
      );

      snapshot = outcome.snapshot;
      return outcome.result;
    },

    checkout(reservationId) {
      const time = readTime();

      // The checkout module also reconciles expired reservations.
      const outcome = checkoutReservation(
        snapshot,
        reservationId,
        time,
      );

      snapshot = outcome.snapshot;
      return outcome.result;
    },

    expireReservations() {
      return reconcile(readTime());
    },

    getSnapshot() {
      reconcile(readTime());

      return {
        ...snapshot,
        reservations: snapshot.reservations.map(
          reservation => ({ ...reservation }),
        ),
      };
    },

    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      snapshot = {
        initialStock: config.initialStock,
        availableStock: config.initialStock,
        reservedStock: 0,
        soldStock: 0,
        reservations: [],
      };
    },
  };
}