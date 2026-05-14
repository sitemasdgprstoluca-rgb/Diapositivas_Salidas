// Setup global para todos los tests del dashboard.
// Importa los matchers de @testing-library/jest-dom (toBeInTheDocument, etc.)
import '@testing-library/jest-dom/vitest';

// Polyfill IntersectionObserver — jsdom no lo trae y framer-motion (useInView) lo usa.
// Dispara isIntersecting:true de inmediato para que las animaciones de entrada
// completen sincrónicamente en tests.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverMock {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      // Simula intersección inmediata.
      this.callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 1,
            target,
            boundingClientRect: target.getBoundingClientRect?.() ?? {},
            intersectionRect: target.getBoundingClientRect?.() ?? {},
            rootBounds: null,
            time: Date.now(),
          },
        ],
        this
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  globalThis.IntersectionObserver = IntersectionObserverMock;
  globalThis.IntersectionObserverEntry = class {};
}

// matchMedia polyfill (next-themes / framer-motion lo invocan en algunos paths)
if (typeof globalThis.matchMedia === 'undefined') {
  globalThis.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
