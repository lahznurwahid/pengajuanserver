// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Module mappings - PERBAIKAN PATH
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Tambahkan mapping untuk frontend-ui
    '^@/app/frontend-ui/(.*)$': '<rootDir>/app/frontend-ui/$1',
  },
  
  // Transform patterns
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: true, // Tambahkan ini
    }],
  },
  
  // Transform ignore patterns - PERBAIKAN UNTUK JOSE
  transformIgnorePatterns: [
    // Izinkan transformasi untuk jose dan module ES6 lainnya
    '/node_modules/(?!(jose|openid-client|next-auth|@panva/hkdf|preact|react-is)/)',
  ],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/test/**/*.test.ts',
    '<rootDir>/test/**/*.test.tsx',
  ],
  
  // Tambahkan ini untuk ESM support
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Coverage
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

export default createJestConfig(config);