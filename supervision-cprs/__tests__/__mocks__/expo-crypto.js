// Mock for expo-crypto
module.exports = {
  randomUUID: jest.fn().mockReturnValue('mock-uuid-1234-5678-9012'),
  getRandomBytes: jest.fn().mockReturnValue(new Uint8Array(16)),
  getRandomBytesAsync: jest.fn().mockResolvedValue(new Uint8Array(16)),
  digestStringAsync: jest.fn().mockResolvedValue('mock-hash'),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA-256',
    SHA512: 'SHA-512',
    MD5: 'MD5',
  },
};
