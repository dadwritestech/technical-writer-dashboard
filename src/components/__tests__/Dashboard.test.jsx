import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';
import { renderWithProviders, mockIndexedDB, createMockProjects, createMockTimeBlocks } from '../../utils/testUtils';

// Mock the database
jest.mock('../../utils/storage', () => ({
  db: mockIndexedDB()
}));

// Mock the time tracking hook
jest.mock('../../hooks/useTimeTracking', () => ({
  useTimeTracking: () => ({
    currentBlock: null,
    elapsedTime: 0,
    isActive: false,
    startTimeBlock: jest.fn(),
    endTimeBlock: jest.fn(),
    pauseTimeBlock: jest.fn(),
    resumeTimeBlock: jest.fn()
  })
}));

// Mock react-router-dom Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard title', async () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('displays loading state initially', async () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Loading time blocks...')).toBeInTheDocument();
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  test('shows today stats cards', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Today\'s Focus Time')).toBeInTheDocument();
      expect(screen.getByText('Research Time')).toBeInTheDocument();
      expect(screen.getByText('Writing Time')).toBeInTheDocument();
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    });
  });

  test('displays current timer when active', async () => {
    // Mock active timer
    jest.doMock('../../hooks/useTimeTracking', () => ({
      useTimeTracking: () => ({
        currentBlock: {
          description: 'Writing API documentation',
          type: 'writing',
          contentType: 'api-docs'
        },
        elapsedTime: 1800, // 30 minutes
        isActive: true,
        startTimeBlock: jest.fn(),
        endTimeBlock: jest.fn(),
        pauseTimeBlock: jest.fn(),
        resumeTimeBlock: jest.fn()
      })
    }));

    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Writing API documentation/)).toBeInTheDocument();
    });
  });

  test('shows documentation debt alert when projects are outdated', async () => {
    const outdatedProjects = createMockProjects(2).map(p => ({
      ...p,
      lastUpdated: '2023-01-01', // Very old date
      maintenanceStatus: 'critical'
    }));

    // Mock database to return outdated projects
    const mockDB = mockIndexedDB();
    mockDB.projects.toArray.mockResolvedValue(outdatedProjects);

    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Documentation Debt Alert/)).toBeInTheDocument();
    });
  });

  test('renders time blocks section', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Today\'s Time Blocks')).toBeInTheDocument();
      expect(screen.getByText('Start Time Tracking')).toBeInTheDocument();
    });
  });

  test('renders active projects section', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('View All Projects')).toBeInTheDocument();
    });
  });

  test('shows empty state when no time blocks exist', async () => {
    const mockDB = mockIndexedDB();
    mockDB.timeBlocks.toArray.mockResolvedValue([]);

    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No time blocks recorded yet today.')).toBeInTheDocument();
    });
  });

  test('shows empty state when no projects exist', async () => {
    const mockDB = mockIndexedDB();
    mockDB.projects.toArray.mockResolvedValue([]);

    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No active projects yet.')).toBeInTheDocument();
    });
  });

  test('navigation links are clickable', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      const timeTrackingLink = screen.getByText('Start Time Tracking');
      const projectsLink = screen.getByText('View All Projects');
      
      expect(timeTrackingLink).toBeInTheDocument();
      expect(projectsLink).toBeInTheDocument();
      expect(timeTrackingLink.closest('a')).toHaveAttribute('href', '/time');
      expect(projectsLink.closest('a')).toHaveAttribute('href', '/projects');
    });
  });
});