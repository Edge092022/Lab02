import type {
  InventorySnapshot,
  Reservation,
  ReservationResult,
} from './inventory-contract';
import { expireReservations } from './expire-reservations';

export interface CheckoutOutcome {
  readonly result: ReservationResult;
  readonly snapshot: InventorySnapshot;
}

export function checkoutReservation(
  snapshot: InventorySnapshot,
  reservationId: string,
  now: number,
): CheckoutOutcome {
  const reconciled = expireReservations(snapshot, now).snapshot;

  const existing = reconciled.reservations.find(
    reservation => reservation.id === reservationId,
  );

  if (!existing) {
    return {
      result: {
        ok: false,
        code: 'RESERVATION_NOT_FOUND',
        message: 'Reservation was not found.',
      },
      snapshot: reconciled,
    };
  }

  if (existing.state === 'EXPIRED') {
    return {
      result: {
        ok: false,
        code: 'RESERVATION_EXPIRED',
        message: 'Reservation has expired.',
      },
      snapshot: reconciled,
    };
  }

  if (existing.state === 'CHECKED_OUT') {
    return {
      result: {
        ok: true,
        reservation: { ...existing },
      },
      snapshot: reconciled,
    };
  }

  const checkedOut: Reservation = {
    ...existing,
    state: 'CHECKED_OUT',
  };

  return {
    result: {
      ok: true,
      reservation: { ...checkedOut },
    },
    snapshot: {
      ...reconciled,
      reservedStock: reconciled.reservedStock - existing.quantity,
      soldStock: reconciled.soldStock + existing.quantity,
      reservations: reconciled.reservations.map(reservation =>
        reservation.id === reservationId ? checkedOut : reservation,
      ),
    },
  };
}
