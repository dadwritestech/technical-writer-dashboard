import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectManager from '../ProjectManager';
import { renderWithProviders, mockIndexedDB, createMockProjects, fillFormField, selectOption } from '../../utils/testUtils';

// Mock the database
const mockDB = mockIndexedDB();
jest.mock('../../utils/storage', () => ({
  db: mockDB,
  saveProject: jest.fn().mockResolvedValue(1),
  updateProject: jest.fn().mockResolvedValue(1)
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('ProjectManager Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDB.projects.toArray.mockResolvedValue(createMockProjects(3));
  });

  test('renders project manager title and new project button', async () => {
    renderWithProviders(<ProjectManager />);
    
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  test('displays loading state initially', async () => {
    mockDB.projects.toArray.mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithProviders(<ProjectManager />);
    
    // Should show skeleton loading
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('displays projects when loaded', async () => {
    renderWithProviders(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
      expect(screen.getByText('Test Project 3')).toBeInTheDocument();
    });
  });

  test('shows new project form when button clicked', async () => {
    renderWithProviders(<ProjectManager />);
    
    const newProjectButton = screen.getByText('New Project');
    await user.click(newProjectButton);
    
    expect(screen.getByText('New Project')).toBeInTheDocument();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/team/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderWithProviders(<ProjectManager />);
    
    const newProjectButton = screen.getByText('New Project');
    await user.click(newProjectButton);
    
    const submitButton = screen.getByText('Create Project');
    await user.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
      expect(screen.getByText('Team selection is required')).toBeInTheDocument();
    });
  });

  test('validates due date is not in the past', async () => {
    renderWithProviders(<ProjectManager />);
    
    const newProjectButton = screen.getByText('New Project');
    await user.click(newProjectButton);
    
    // Fill required fields
    await fillFormField(user, 'project name', 'Test Project');
    await selectOption(user, 'team', 'Team Alpha');
    
    // Set due date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dueDateField = screen.getByLabelText(/due date/i);
    await user.type(dueDateField, yesterday.toISOString().split('T')[0]);
    
    const submitButton = screen.getByText('Create Project');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Due date cannot be in the past')).toBeInTheDocument();
    });
  });

  test('creates new project with valid data', async () => {
    const { saveProject } = require('../../utils/storage');
    renderWithProviders(<ProjectManager />);
    
    const newProjectButton = screen.getByText('New Project');
    await user.click(newProjectButton);
    
    // Fill form with valid data
    await fillFormField(user, 'project name', 'New Test Project');
    await selectOption(user, 'team', 'Team Alpha');
    await fillFormField(user, 'description', 'Project description');
    
    const submitButton = screen.getByText('Create Project');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(saveProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test Project',
          team: 'Team Alpha',
          description: 'Project description'
        })
      );
    });
  });

  test('opens edit form when edit button clicked', async () => {
    renderWithProviders(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByLabelText(/edit/i);
    await user.click(editButtons[0]);
    
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Project 1')).toBeInTheDocument();
  });

  test('archives project when archive button clicked', async () => {
    const { updateProject } = require('../../utils/storage');
    renderWithProviders(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
    
    const archiveButtons = screen.getAllByLabelText(/archive/i);
    await user.click(archiveButtons[0]);
    
    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith(1, { status: 'archived' });
    });
  });

  test('shows documentation debt warning for outdated projects', async () => {
    const outdatedProjects = createMockProjects(1).map(p => ({
      ...p,
      maintenanceStatus: 'critical',
      lastUpdated: '2023-01-01'
    }));
    
    mockDB.projects.toArray.mockResolvedValue(outdatedProjects);
    renderWithProviders(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText(/Documentation Debt: Critical/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no projects exist', async () => {
    mockDB.projects.toArray.mockResolvedValue([]);
    renderWithProviders(<ProjectManager />);
    
    await waitFor(() => {
      expect(screen.getByText('No projects yet. Create your first project!')).toBeInTheDocument();
    });
  });

  test('cancels form and resets data', async () => {
    renderWithProviders(<ProjectManager />);
    
    const newProjectButton = screen.getByText('New Project');
    await user.click(newProjectButton);
    
    await fillFormField(user, 'project name', 'Test Name');
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    // Form should be hidden
    expect(screen.queryByLabelText(/project name/i)).not.toBeInTheDocument();
  });
});