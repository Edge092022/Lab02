import './style.css';
import { mountFlashSale } from './flash-sale-controller';

const root = document.querySelector<HTMLElement>('#main-content');

if (!root) {
  throw new Error('Missing main content.');
}

const dispose = mountFlashSale(root);

// Release the old controller before Vite replaces this module.
if (import.meta.hot) {
  import.meta.hot.dispose(dispose);
}