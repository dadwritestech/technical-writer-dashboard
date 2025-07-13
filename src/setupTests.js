import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IndexedDB
const mockIDBRequest = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  result: undefined,
  error: null,
  readyState: 'done'
};

const mockIDBDatabase = {
  createObjectStore: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn()
};

global.indexedDB = {
  open: jest.fn().mockReturnValue(mockIDBRequest),
  deleteDatabase: jest.fn().mockReturnValue(mockIDBRequest),
  databases: jest.fn().mockResolvedValue([])
};

// Mock Dexie
jest.mock('dexie', () => {
  return {
    Dexie: class MockDexie {
      constructor() {
        this.version = jest.fn().mockReturnThis();
        this.stores = jest.fn().mockReturnThis();
        this.open = jest.fn().mockResolvedValue(this);
      }
    }
  };
});

// Suppress console errors in tests unless they're expected
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});