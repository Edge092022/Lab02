import type { InventorySnapshot } from './inventory-contract';

export function renderInventory(
  root: HTMLElement,
  snapshot: InventorySnapshot,
): void {
  function required<T extends HTMLElement>(selector: string): T {
    const element = root.querySelector<T>(selector);

    if (!element) {
      throw new Error(`Missing inventory element: ${selector}`);
    }

    return element;
  }

  const initial = required('#initial-stock');
  const available = required('#available-stock');
  const reserved = required('#reserved-stock');
  const sold = required('#sold-stock');
  const empty = required('#reservations-empty');
  const list = required<HTMLUListElement>('#reservation-list');

  const activeElement = root.ownerDocument.activeElement;
  const focusedButton =
    activeElement instanceof HTMLButtonElement &&
    list.contains(activeElement)
      ? activeElement
      : null;

  const focusedId = focusedButton?.dataset.reservationId;

  initial.textContent = String(snapshot.initialStock);
  available.textContent = String(snapshot.availableStock);
  reserved.textContent = String(snapshot.reservedStock);
  sold.textContent = String(snapshot.soldStock);
  empty.hidden = snapshot.reservations.length > 0;

  const labels = {
    RESERVED: 'Đang giữ',
    EXPIRED: 'Đã hết hạn',
    CHECKED_OUT: 'Đã thanh toán',
  } as const;

  const fragment = document.createDocumentFragment();
  let focusTarget: HTMLButtonElement | null = null;

  for (const reservation of snapshot.reservations) {
    const item = document.createElement('li');
    const details = document.createElement('p');

    details.textContent =
      `Mã ${reservation.requestId} · ` +
      `${reservation.quantity} sản phẩm · ` +
      labels[reservation.state];

    item.append(details);

    if (reservation.state === 'RESERVED') {
      const expiry = document.createElement('p');
      expiry.textContent =
        'Hạn thanh toán: ' +
        new Date(reservation.expiresAt).toLocaleTimeString('vi-VN');

      item.append(expiry);
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = 'checkout';
    button.dataset.reservationId = reservation.id;
    button.textContent = 'Thanh toán';
    button.setAttribute(
      'aria-label',
      `Thanh toán yêu cầu ${reservation.requestId}`,
    );
    button.disabled = reservation.state !== 'RESERVED';

    if (reservation.id === focusedId) {
      focusTarget = button;
    }

    item.append(button);
    fragment.append(item);
  }

  list.replaceChildren(fragment);

  if (focusedButton) {
    if (focusTarget && !focusTarget.disabled) {
      focusTarget.focus();
    } else {
      // Keep focus in the main content if the old action is unavailable.
      root.focus();
    }
  }
}