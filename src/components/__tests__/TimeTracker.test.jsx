import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeTracker from '../TimeTracker';
import { renderWithProviders, mockIndexedDB, createMockProjects, createMockTimeBlocks } from '../../utils/testUtils';

// Mock the database
const mockDB = mockIndexedDB();
jest.mock('../../utils/storage', () => ({
  db: mockDB
}));

// Mock the time tracking hook
const mockTimeTracking = {
  currentBlock: null,
  elapsedTime: 0,
  isActive: false,
  startTimeBlock: jest.fn(),
  endTimeBlock: jest.fn(),
  pauseTimeBlock: jest.fn(),
  resumeTimeBlock: jest.fn()
};

jest.mock('../../hooks/useTimeTracking', () => ({
  useTimeTracking: () => mockTimeTracking
}));

// Mock react-hot-toast
const mockToast = {
  success: jest.fn(),
  error: jest.fn()
};
jest.mock('react-hot-toast', () => mockToast);

describe('TimeTracker Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDB.projects.toArray.mockResolvedValue(createMockProjects(3));
    mockDB.timeBlocks.toArray.mockResolvedValue(createMockTimeBlocks(3));
    
    // Reset mock state
    mockTimeTracking.currentBlock = null;
    mockTimeTracking.elapsedTime = 0;
    mockTimeTracking.isActive = false;
  });

  test('renders time tracker title', () => {
    renderWithProviders(<TimeTracker />);
    expect(screen.getByText('Time Tracking')).toBeInTheDocument();
  });

  test('displays timer when no active block', async () => {
    renderWithProviders(<TimeTracker />);
    
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('Start Timer')).toBeInTheDocument();
  });

  test('shows work phase selection buttons', async () => {
    renderWithProviders(<TimeTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('Research & Discovery')).toBeInTheDocument();
      expect(screen.getByText('Writing & Creation')).toBeInTheDocument();
      expect(screen.getByText('Review & Editing')).toBeInTheDocument();
    });
  });

  test('shows project selection dropdown', async () => {
    renderWithProviders(<TimeTracker />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
      expect(screen.getByText('Select a project...')).toBeInTheDocument();
    });
  });

  test('validates required fields before starting timer', async () => {
    renderWithProviders(<TimeTracker />);
    
    const startButton = screen.getByText('Start Timer');
    await user.click(startButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Please select a project');
    });
  });

  test('validates description field', async () => {
    renderWithProviders(<TimeTracker />);
    
    // Select a project but leave description empty
    const projectSelect = screen.getByLabelText(/project/i);
    await user.selectOptions(projectSelect, '1');
    
    const startButton = screen.getByText('Start Timer');
    await user.click(startButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Please provide a task description');
    });
  });

  test('starts timer with valid data', async () => {
    renderWithProviders(<TimeTracker />);
    
    await waitFor(() => {
      const projectSelect = screen.getByLabelText(/project/i);
      expect(projectSelect).toBeInTheDocument();
    });
    
    // Fill form
    const projectSelect = screen.getByLabelText(/project/i);
    await user.selectOptions(projectSelect, '1');
    
    const descriptionField = screen.getByLabelText(/description/i);
    await user.type(descriptionField, 'Working on API docs');
    
    const startButton = screen.getByText('Start Timer');
    await user.click(startButton);
    
    expect(mockTimeTracking.startTimeBlock).toHaveBeenCalledWith(
      'research', // default work phase
      '1', // project id
      'Working on API docs',
      'user-guides' // default content type
    );
  });

  test('displays active timer state', () => {
    mockTimeTracking.currentBlock = {
      description: 'Writing documentation',
      type: 'writing',
      contentType: 'user-guides'
    };
    mockTimeTracking.elapsedTime = 1800; // 30 minutes
    mockTimeTracking.isActive = true;
    
    renderWithProviders(<TimeTracker />);
    
    expect(screen.getByText('Writing documentation')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  test('displays paused timer state', () => {
    mockTimeTracking.currentBlock = {
      description: 'Writing documentation',
      type: 'writing',
      contentType: 'user-guides'
    };
    mockTimeTracking.elapsedTime = 900; // 15 minutes
    mockTimeTracking.isActive = false;
    
    renderWithProviders(<TimeTracker />);
    
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  test('pauses timer when pause button clicked', async () => {
    mockTimeTracking.currentBlock = { description: 'Test task' };
    mockTimeTracking.isActive = true;
    
    renderWithProviders(<TimeTracker />);
    
    const pauseButton = screen.getByText('Pause');
    await user.click(pauseButton);
    
    expect(mockTimeTracking.pauseTimeBlock).toHaveBeenCalled();
  });

  test('resumes timer when resume button clicked', async () => {
    mockTimeTracking.currentBlock = { description: 'Test task' };
    mockTimeTracking.isActive = false;
    
    renderWithProviders(<TimeTracker />);
    
    const resumeButton = screen.getByText('Resume');
    await user.click(resumeButton);
    
    expect(mockTimeTracking.resumeTimeBlock).toHaveBeenCalled();
  });

  test('stops timer when stop button clicked', async () => {
    mockTimeTracking.currentBlock = { description: 'Test task' };
    
    renderWithProviders(<TimeTracker />);
    
    const stopButton = screen.getByText('Stop');
    await user.click(stopButton);
    
    expect(mockTimeTracking.endTimeBlock).toHaveBeenCalled();
  });

  test('displays today\'s sessions', async () => {
    renderWithProviders(<TimeTracker />);
    
    await waitFor(() => {
      expect(screen.getByText('Today\'s Sessions')).toBeInTheDocument();
    });
  });

  test('shows validation errors inline', async () => {
    renderWithProviders(<TimeTracker />);
    
    // Check for inline validation messages
    expect(screen.getByText('Project selection is required')).toBeInTheDocument();
    expect(screen.getByText('Task description is required')).toBeInTheDocument();
  });

  test('changes work phase when button clicked', async () => {
    renderWithProviders(<TimeTracker />);
    
    const writingButton = screen.getByText('Writing & Creation');
    await user.click(writingButton);
    
    // The button should be selected (this would be visual in the app)
    expect(writingButton.closest('button')).toHaveClass('border-green-500');
  });
});