import './style.css';
import { mountAudioApplication } from './audio-app';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('Application root is missing.');
}

const disposeApplication = mountAudioApplication(root);

function handlePageHide(event: PageTransitionEvent): void {
  if (!event.persisted) {
    disposeApplication();
  }
}

window.addEventListener('pagehide', handlePageHide);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('pagehide', handlePageHide);
    disposeApplication();
  });
}