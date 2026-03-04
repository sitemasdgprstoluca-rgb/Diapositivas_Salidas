/**
 * Jest Setup File
 * Configuración global para todos los tests
 * Los mocks de expo modules están en __tests__/__mocks__/
 */

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Global test timeout
jest.setTimeout(60000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
