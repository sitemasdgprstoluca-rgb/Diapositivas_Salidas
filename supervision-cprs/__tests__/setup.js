/**
 * Jest Setup File
 * Configuración global para todos los tests
 * Los mocks de expo modules están en __tests__/__mocks__/
 */

// Variables globales de React Native que los módulos esperan
global.__DEV__ = false;

// Mock inline de react-native para que Platform funcione
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', Version: 17, select: (obj) => obj.ios || obj.default },
  AppState: { addEventListener: jest.fn(() => ({ remove: jest.fn() })) },
  NativeModules: {},
}));

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
