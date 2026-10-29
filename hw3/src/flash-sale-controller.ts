import { simulatePurchases } from './purchase-simulation';
import { createAntiDriftTimer } from './anti-drift-timer';
import { createInventoryEngine } from './inventory-engine';
import { renderInventory } from './render-inventory';
import type { ReservationResult } from './inventory-contract';

const mountedRoots = new WeakSet<HTMLElement>();

export function mountFlashSale(root: HTMLElement): () => void {
  if (mountedRoots.has(root)) {
    throw new Error('A flash-sale controller is already mounted here.');
  }

  function required<T extends HTMLElement>(selector: string): T {
    const element = root.querySelector<T>(selector);

    if (!element) {
      throw new Error(`Missing controller element: ${selector}`);
    }

    return element;
  }

  const form = required<HTMLFormElement>('#reserve-form');
  const requestInput = required<HTMLInputElement>('#request-id');
  const quantityInput = required<HTMLInputElement>('#quantity');
  const reserveButton = required<HTMLButtonElement>('#reserve-button');
  const simulateButton = required<HTMLButtonElement>('#simulate-button');
  const buyerCount = required<HTMLInputElement>('#buyer-count');
  const simulationResult = required('#simulation-result');
  const countdown = required('#countdown');
  const saleStatus = required('#sale-status');
  const feedback = required('#feedback');
  const setupNote = required('#setup-note');

  const saleEndsAt = Date.now() + 120_000;
  const engine = createInventoryEngine({
    initialStock: 10,
    reservationTtlMs: 15_000,
    saleEndsAt,
  });

  let disposed = false;
  let cancelCountdown: () => void = () => {};
  let expiryInterval: number | undefined;
  let saleEnded = false;
  let simulationAbort: AbortController | null = null;

  function render(): void {
    renderInventory(root, engine.getSnapshot());
  }

  function showResult(result: ReservationResult): void {
    if (!result.ok) {
      feedback.textContent = result.message;
      return;
    }

    const reservation = result.reservation;
    const labels = {
      RESERVED: 'Đang giữ hàng',
      EXPIRED: 'Đã hết hạn giữ hàng',
      CHECKED_OUT: 'Đã thanh toán',
    } as const;

    feedback.textContent =
      `${labels[reservation.state]}: yêu cầu ` +
      `${reservation.requestId}, ${reservation.quantity} sản phẩm.`;
  }

  function updateSaleStatus(): void {
    const ended = Date.now() >= saleEndsAt;

    reserveButton.disabled = disposed || ended;
    simulateButton.disabled =
      disposed || ended || simulationAbort !== null;

    saleStatus.textContent = ended
      ? 'Phiên sale đã kết thúc'
      : 'Đang mở bán';

    if (ended && !saleEnded) {
      feedback.textContent =
        'Sale đã kết thúc. Lượt giữ còn hạn vẫn có thể thanh toán.';
    }

    saleEnded = ended;
  }

  function onSubmit(event: Event): void {
    if (event.target !== form) {
      return;
    }

    event.preventDefault();

    if (disposed || !form.reportValidity()) {
      return;
    }

    try {
      const result = engine.reserve({
        requestId: requestInput.value,
        quantity: quantityInput.valueAsNumber,
      });

      render();
      updateSaleStatus();
      showResult(result);
    } catch (error) {
      feedback.textContent =
        error instanceof Error ? error.message : 'Không thể giữ hàng.';
    }
  }

  async function runSimulation(): Promise<void> {
    if (disposed || simulationAbort !== null) {
      return;
    }

    if (!buyerCount.reportValidity()) {
      return;
    }

    if (Date.now() >= saleEndsAt) {
      updateSaleStatus();
      return;
    }

    const controller = new AbortController();
    simulationAbort = controller;
    updateSaleStatus();

    simulationResult.textContent = 'Đang xử lý các yêu cầu...';

    try {
      const report = await simulatePurchases(
        engine,
        buyerCount.valueAsNumber,
        controller.signal,
      );

      if (disposed || controller.signal.aborted) {
        return;
      }

      render();

      simulationResult.textContent =
        `Tổng ${report.requested} yêu cầu: ` +
        `${report.accepted} giữ hàng thành công, ` +
        `${report.rejected} bị từ chối, ` +
        `${report.cancelled} đã hủy, ` +
        `${report.errors} lỗi.`;

      feedback.textContent =
        'Mô phỏng hoàn tất. Các lượt giữ thành công có hạn 15 giây.';
    } catch (error) {
      if (!disposed) {
        simulationResult.textContent =
          error instanceof Error
            ? error.message
            : 'Không thể chạy mô phỏng.';
      }
    } finally {
      if (simulationAbort === controller) {
        simulationAbort = null;
      }

      if (!disposed) {
        updateSaleStatus();
      }
    }
  }

  function onClick(event: MouseEvent): void {
    if (disposed || !(event.target instanceof Element)) {
      return;
    }

    const simulationButton =
      event.target.closest<HTMLButtonElement>('#simulate-button');

    if (
      simulationButton === simulateButton &&
      !simulateButton.disabled
    ) {
      void runSimulation();
      return;
    }

    const button = event.target.closest<HTMLButtonElement>(
      'button[data-action="checkout"]',
    );

    if (!button || !root.contains(button) || button.disabled) {
      return;
    }

    const reservationId = button.dataset.reservationId;

    if (!reservationId) {
      return;
    }

    try {
      const result = engine.checkout(reservationId);
      render();
      showResult(result);
    } catch (error) {
      feedback.textContent =
        error instanceof Error ? error.message : 'Không thể thanh toán.';
    }
  }

  function dispose(): void {
    if (disposed) {
      return;
    }

    disposed = true;

    simulationAbort?.abort();
    simulationAbort = null;

    cancelCountdown();

    if (expiryInterval !== undefined) {
      window.clearInterval(expiryInterval);
    }

    root.removeEventListener('submit', onSubmit);
    root.removeEventListener('click', onClick);

    engine.dispose();

    reserveButton.disabled = true;
    simulateButton.disabled = true;

    for (const button of root.querySelectorAll<HTMLButtonElement>(
      'button[data-action="checkout"]',
    )) {
      button.disabled = true;
    }

    mountedRoots.delete(root);
  }

  mountedRoots.add(root);

  try {
    render();
    updateSaleStatus();

    setupNote.textContent =
      'Mô phỏng: 10 sản phẩm · Sale 2 phút · Giữ hàng 15 giây.';
    feedback.textContent = 'Sẵn sàng giữ hàng.';
    simulationResult.textContent = 'Chưa chạy mô phỏng.';

    root.addEventListener('submit', onSubmit);
    root.addEventListener('click', onClick);

    cancelCountdown = createAntiDriftTimer(
      Math.max(0, saleEndsAt - Date.now()),
      () => {
        if (disposed) {
          return;
        }

        // Dùng cùng thời điểm kết thúc với inventory engine.
        const remaining = Math.max(0, saleEndsAt - Date.now());
        const minutes = Math.floor(remaining / 60_000);
        const seconds = Math.floor((remaining % 60_000) / 1000);
        const milliseconds = remaining % 1000;

        countdown.textContent =
          `${String(minutes).padStart(2, '0')}:` +
          `${String(seconds).padStart(2, '0')}.` +
          String(milliseconds).padStart(3, '0');

        updateSaleStatus();
      },
    );

    expiryInterval = window.setInterval(() => {
      if (disposed) {
        return;
      }

      try {
        const expiredCount = engine.expireReservations();

        if (expiredCount > 0) {
          render();
          feedback.textContent =
            `${expiredCount} lượt giữ đã hết hạn; hàng đã trả về kho.`;
        }

        updateSaleStatus();
      } catch (error) {
        dispose();
        feedback.textContent =
          error instanceof Error ? error.message : 'Ứng dụng đã dừng.';
      }
    }, 200);
  } catch (error) {
    dispose();
    throw error;
  }

  return dispose;
}