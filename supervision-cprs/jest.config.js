module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/unit/**/*.test.js',
    '**/__tests__/integration/**/*.test.js',
    '**/__tests__/stress/**/*.test.js',
    '**/__tests__/golden/**/*.test.js',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo.*|@expo.*|react-native.*|@react-native.*|pptxgenjs)/)',
  ],
  moduleNameMapper: {
    '^expo-file-system/legacy$': '<rootDir>/__tests__/__mocks__/expo-file-system.js',
    '^expo-file-system$': '<rootDir>/__tests__/__mocks__/expo-file-system.js',
    '^expo-sharing$': '<rootDir>/__tests__/__mocks__/expo-sharing.js',
    '^expo-print$': '<rootDir>/__tests__/__mocks__/expo-print.js',
    '^expo-crypto$': '<rootDir>/__tests__/__mocks__/expo-crypto.js',
    '^expo-image-picker$': '<rootDir>/__tests__/__mocks__/expo-image-picker.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__tests__/__mocks__/async-storage.js',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 60000,
  verbose: true,
  maxWorkers: '50%',
  reporters: ['default'],
};
