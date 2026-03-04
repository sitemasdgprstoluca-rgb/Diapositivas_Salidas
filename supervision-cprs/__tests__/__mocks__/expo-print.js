// Mock for expo-print
module.exports = {
  printAsync: jest.fn().mockResolvedValue(undefined),
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///mock/output.pdf' }),
  selectPrinterAsync: jest.fn().mockResolvedValue(undefined),
};
