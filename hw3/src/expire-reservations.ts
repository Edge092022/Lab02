import type { InventorySnapshot } from './inventory-contract';

export interface ExpiryOutcome {
  readonly snapshot: InventorySnapshot;
  readonly expiredCount: number;
}

/**
 * Internal transition function operating on a valid inventory snapshot.
 * Expiry depends on timestamps, not on punctual timer callbacks.
 */
export function expireReservations(
  snapshot: InventorySnapshot,
  now: number,
): ExpiryOutcome {
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new RangeError('Invalid clock timestamp.');
  }

  let expiredCount = 0;
  let releasedQuantity = 0;

  const reservations = snapshot.reservations.map(reservation => {
    if (
      reservation.state !== 'RESERVED' ||
      now < reservation.expiresAt
    ) {
      return reservation;
    }

    expiredCount++;
    releasedQuantity += reservation.quantity;

    return {
      ...reservation,
      state: 'EXPIRED' as const,
    };
  });

  if (expiredCount === 0) {
    return { snapshot, expiredCount: 0 };
  }

  return {
    snapshot: {
      ...snapshot,
      availableStock: snapshot.availableStock + releasedQuantity,
      reservedStock: snapshot.reservedStock - releasedQuantity,
      reservations,
    },
    expiredCount,
  };
}