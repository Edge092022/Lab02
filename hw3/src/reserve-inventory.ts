import type {
  InventoryErrorCode,
  InventoryOptions,
  InventorySnapshot,
  Reservation,
  ReservationResult,
  ReserveInput,
} from './inventory-contract';

export interface ReserveOutcome {
  readonly result: ReservationResult;
  readonly snapshot: InventorySnapshot;
}

/**
 * Internal transition function.
 * Caller supplies a valid snapshot with expiry already reconciled.
 * Caller must store the returned snapshot before processing another request.
 */
export function reserveInventory(
  snapshot: InventorySnapshot,
  input: ReserveInput,
  options: InventoryOptions,
  now: number,
): ReserveOutcome {
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new RangeError('Invalid clock timestamp.');
  }

  function fail(
    code: InventoryErrorCode,
    message: string,
  ): ReserveOutcome {
    return {
      result: { ok: false, code, message },
      snapshot,
    };
  }

  if (
    typeof input?.requestId !== 'string' ||
    input.requestId.length === 0 ||
    input.requestId.trim() !== input.requestId ||
    !Number.isSafeInteger(input.quantity) ||
    input.quantity <= 0
  ) {
    return fail('INVALID_INPUT', 'Invalid request ID or quantity.');
  }

  const existing = snapshot.reservations.find(
    reservation => reservation.requestId === input.requestId,
  );

  if (existing) {
    if (existing.quantity !== input.quantity) {
      return fail(
        'REQUEST_CONFLICT',
        'Request ID was already used with another quantity.',
      );
    }

    return {
      result: { ok: true, reservation: { ...existing } },
      snapshot,
    };
  }

  if (now >= options.saleEndsAt) {
    return fail('SALE_ENDED', 'The flash sale has ended.');
  }

  if (input.quantity > snapshot.availableStock) {
    return fail('INSUFFICIENT_STOCK', 'Not enough available stock.');
  }

  const expiresAt = now + options.reservationTtlMs;

  if (!Number.isSafeInteger(expiresAt)) {
    throw new RangeError('Reservation expiry exceeds timestamp limits.');
  }

  // The engine retains every reservation, so this ID is unique per engine.
  const id = `reservation:${input.requestId}`;

  const reservation: Reservation = {
    id,
    requestId: input.requestId,
    quantity: input.quantity,
    state: 'RESERVED',
    createdAt: now,
    expiresAt,
  };

  const nextSnapshot: InventorySnapshot = {
    ...snapshot,
    availableStock: snapshot.availableStock - input.quantity,
    reservedStock: snapshot.reservedStock + input.quantity,
    reservations: [...snapshot.reservations, reservation],
  };

  return {
    result: { ok: true, reservation: { ...reservation } },
    snapshot: nextSnapshot,
  };
}