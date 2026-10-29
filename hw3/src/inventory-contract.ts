export type ReservationState =
  | 'RESERVED'
  | 'EXPIRED'
  | 'CHECKED_OUT';

export interface Reservation {
  readonly id: string;
  readonly requestId: string;
  readonly quantity: number;
  readonly state: ReservationState;
  readonly createdAt: number;
  readonly expiresAt: number;
}

export interface InventorySnapshot {
  readonly initialStock: number;
  readonly availableStock: number;
  readonly reservedStock: number;
  readonly soldStock: number;
  readonly reservations: readonly Reservation[];
}

export interface ReserveInput {
  readonly requestId: string;
  readonly quantity: number;
}

export type InventoryErrorCode =
  | 'INVALID_INPUT'
  | 'SALE_ENDED'
  | 'INSUFFICIENT_STOCK'
  | 'REQUEST_CONFLICT'
  | 'RESERVATION_NOT_FOUND'
  | 'RESERVATION_EXPIRED';

export interface InventoryFailure {
  readonly ok: false;
  readonly code: InventoryErrorCode;
  readonly message: string;
}

export interface ReservationSuccess {
  readonly ok: true;
  readonly reservation: Reservation;
}

export type ReservationResult =
  | ReservationSuccess
  | InventoryFailure;

export interface InventoryOptions {
  readonly initialStock: number;
  readonly reservationTtlMs: number;
  readonly saleEndsAt: number;

  // Defaults to Date.now; injected clocks support deterministic checks.
  readonly now?: () => number;
}

export interface InventoryEngine {
  /**
   * Reconcile expiry before processing.
   * Validate input before checking request-ID reuse.
   * Same requestId + quantity returns the original reservation,
   * including its current terminal state, without reserving again.
   * Different quantity for an existing requestId returns REQUEST_CONFLICT.
   * For new requests, reject when now >= saleEndsAt.
   * Check and reserve stock synchronously, without an await boundary.
   */
  reserve(input: ReserveInput): ReservationResult;

  /**
   * Reconcile expiry first.
   * Reject a RESERVED reservation when now >= expiresAt.
   * Repeated checkout of CHECKED_OUT returns the existing success.
   * Never consume stock twice.
   */
  checkout(reservationId: string): ReservationResult;

  /**
   * Release each expired RESERVED reservation exactly once.
   * Return the number of reservations expired by this call.
   */
  expireReservations(): number;

  /**
   * Reconcile expiry, then return a detached snapshot.
   * Changing returned objects must not change internal state.
   */
  getSnapshot(): InventorySnapshot;

  /**
   * Release owned resources; repeated disposal is safe.
   * All other methods throw Error after disposal.
   */
  dispose(): void;
}

/**
 * Factory contract for the upcoming implementation:
 *
 * createInventoryEngine(options: InventoryOptions): InventoryEngine
 *
 * Reject invalid options with RangeError:
 * - initialStock must be a non-negative safe integer.
 * - reservationTtlMs must be a positive safe integer.
 * - saleEndsAt must be a non-negative safe integer timestamp.
 *
 * Clock values must be non-negative safe integer timestamps.
 * An invalid clock value throws RangeError before state mutation.
 * Computed expiry timestamps must remain safe integers.
 *
 * requestId must be a nonblank string with no surrounding whitespace.
 * quantity must be a positive safe integer.
 * Invalid reservation input returns INVALID_INPUT.
 * Blank or unknown checkout IDs return RESERVATION_NOT_FOUND.
 *
 * Conservation invariant:
 * initialStock = availableStock + reservedStock + soldStock.
 *
 * All stock counts remain non-negative safe integers.
 * Reservation IDs must be unique within the engine.
 * Terminal reservations never transition back to RESERVED.
 * Expiry is enforced by operations even if scheduled cleanup is delayed.
 * This contract does not guarantee locking across tabs or servers.
 */