// Testing utilities for Technical Writer Dashboard
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext.jsx';

// Mock IndexedDB for testing
export const mockIndexedDB = () => {
  const mockDB = {
    projects: {
      toArray: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockReturnThis(),
      notEqual: jest.fn().mockReturnThis(),
      between: jest.fn().mockReturnThis(),
      reverse: jest.fn().mockReturnThis(),
      add: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockResolvedValue(1),
      delete: jest.fn().mockResolvedValue()
    },
    timeBlocks: {
      toArray: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockReturnThis(),
      between: jest.fn().mockReturnThis(),
      reverse: jest.fn().mockReturnThis(),
      add: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockResolvedValue(1)
    }
  };
  return mockDB;
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialEntries = ['/'],
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock project data for testing
export const mockProject = {
  id: 1,
  name: 'Test Project',
  team: 'Team Alpha',
  description: 'Test project description',
  status: 'in-progress',
  priority: 'high',
  contentType: 'user-guides',
  version: 'draft-1',
  dueDate: '2024-12-31',
  lastUpdated: '2024-01-15',
  maintenanceStatus: 'current'
};

// Mock time block data for testing
export const mockTimeBlock = {
  id: 1,
  type: 'writing',
  contentType: 'user-guides',
  projectId: 1,
  description: 'Writing user documentation',
  startTime: new Date().toISOString(),
  endTime: null,
  duration: 0,
  date: new Date().toISOString(),
  status: 'active'
};

// Test data factories
export const createMockProjects = (count = 3) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockProject,
    id: index + 1,
    name: `Test Project ${index + 1}`,
    status: ['planning', 'in-progress', 'review'][index % 3]
  }));
};

export const createMockTimeBlocks = (count = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockTimeBlock,
    id: index + 1,
    description: `Task ${index + 1}`,
    duration: (index + 1) * 30,
    status: index < 3 ? 'completed' : 'active'
  }));
};

// Common test assertions
export const expectElementToBeVisible = (element) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectButtonToBeClickable = (button) => {
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
};

// Form testing helpers
export const fillFormField = async (user, fieldName, value) => {
  const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
  await user.clear(field);
  await user.type(field, value);
  return field;
};

export const selectOption = async (user, selectLabel, optionText) => {
  const select = screen.getByLabelText(new RegExp(selectLabel, 'i'));
  await user.selectOptions(select, optionText);
  return select;
};

// Wait for async operations
export const waitForLoadingToFinish = async () => {
  await screen.findByText(/loading/i, {}, { timeout: 3000 });
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

// Mock localStorage
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  return localStorageMock;
};