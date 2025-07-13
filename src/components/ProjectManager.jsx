import React, { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Edit2, 
  Archive, 
  CheckCircle,
  Clock,
  AlertCircle,
  Folder,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { db, saveProject, updateProject } from '../utils/storage';
import { formatDate } from '../utils/dateHelpers';
import { contentTypes, documentVersions, maintenanceStatus, getContentTypeByValue, getVersionByValue, getMaintenanceStatusByValue, calculateMaintenanceStatus } from '../utils/contentTypes';
import toast from 'react-hot-toast';
import { SkeletonList } from './SkeletonCard';
import MemoizedProjectCard from './MemoizedProjectCard';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';
import { PERFORMANCE_LIMITS } from '../utils/constants';
import { debounce } from '../utils/performance';

const ProjectManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    team: 'all',
    contentType: 'all'
  });
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    dueDate: '',
    contentType: 'user-guides',
    version: 'draft-1',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  // Get all projects with client-side filtering
  const allProjects = useLiveQuery(
    () => db.projects.reverse().toArray(),
    []
  );

  // Apply filters and search
  const filteredProjects = useMemo(() => {
    if (!allProjects) return [];
    
    return allProjects.filter(project => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          project.name.toLowerCase().includes(searchLower) ||
          project.team.toLowerCase().includes(searchLower) ||
          (project.description && project.description.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && project.status !== filters.status) return false;
      
      // Team filter
      if (filters.team !== 'all' && project.team !== filters.team) return false;
      
      // Content type filter
      if (filters.contentType !== 'all' && project.contentType !== filters.contentType) return false;
      
      return true;
    });
  }, [allProjects, searchTerm, filters]);

  // Pagination
  const pagination = usePagination(filteredProjects, PERFORMANCE_LIMITS.projectsPage.itemsPerPage);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((term) => setSearchTerm(term), PERFORMANCE_LIMITS.projectsPage.searchDebounce),
    []
  );

  const teams = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Other'];
  const statuses = [
    { value: 'planning', label: 'Planning', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', color: 'yellow' },
    { value: 'review', label: 'Review', color: 'purple' },
    { value: 'published', label: 'Published', color: 'green' },
    { value: 'archived', label: 'Archived', color: 'gray' }
  ];
  const priorities = [
    { value: 'high', label: 'High', color: 'red' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'low', label: 'Low', color: 'green' }
  ];

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Project name is required');
    }
    
    if (!formData.team) {
      errors.push('Team selection is required');
    }
    
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      errors.push('Due date cannot be in the past');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    try {
      const projectData = {
        ...formData,
        maintenanceStatus: calculateMaintenanceStatus(formData.lastUpdated)
      };
      
      if (editingProject) {
        await updateProject(editingProject.id, projectData);
        toast.success('Project updated successfully');
      } else {
        await saveProject(projectData);
        toast.success('Project created successfully');
      }
      
      setFormData({
        name: '',
        team: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        dueDate: '',
        contentType: 'user-guides',
        version: 'draft-1',
        lastUpdated: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setEditingProject(null);
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleEdit = useCallback((project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      team: project.team,
      description: project.description || '',
      status: project.status,
      priority: project.priority || 'medium',
      dueDate: project.dueDate || '',
      contentType: project.contentType || 'user-guides',
      version: project.version || 'draft-1',
      lastUpdated: project.lastUpdated || new Date().toISOString().split('T')[0]
    });
    setShowAddForm(true);
  }, []);

  const handleArchive = useCallback(async (projectId) => {
    await updateProject(projectId, { status: 'archived' });
    toast.success('Project archived');
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planning': return Clock;
      case 'in-progress': return AlertCircle;
      case 'review': return Edit2;
      case 'published': return CheckCircle;
      case 'archived': return Archive;
      default: return Folder;
    }
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'gray';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projects</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pagination.totalItems} total projects {filteredProjects.length !== allProjects?.length && `(${filteredProjects.length} filtered)`}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Projects
            </label>
            <input
              type="text"
              placeholder="Search by name, team, or description..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team
            </label>
            <select
              value={filters.team}
              onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Content Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content Type
            </label>
            <select
              value={filters.contentType}
              onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
            >
              <option value="all">All Types</option>
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editingProject ? 'Edit Project' : 'New Project'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                  aria-describedby="name-error"
                />
                {!formData.name.trim() && (
                  <p id="name-error" className="mt-1 text-sm text-red-600">Project name is required</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content Type
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Team
                </label>
                <select
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                  aria-describedby="team-error"
                >
                  <option value="">Select team...</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                {!formData.team && (
                  <p id="team-error" className="mt-1 text-sm text-red-600">Team selection is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Version
                </label>
                <select
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                >
                  {documentVersions.map((version) => (
                    <option key={version.value} value={version.value}>
                      {version.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                  aria-describedby="due-date-error"
                />
                {formData.dueDate && new Date(formData.dueDate) < new Date() && (
                  <p id="due-date-error" className="mt-1 text-sm text-red-600">Due date cannot be in the past</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Updated
                </label>
                <input
                  type="date"
                  value={formData.lastUpdated}
                  onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProject(null);
                  setFormData({
                    name: '',
                    team: '',
                    description: '',
                    status: 'planning',
                    priority: 'medium',
                    dueDate: '',
                    contentType: 'user-guides',
                    version: 'draft-1',
                    lastUpdated: new Date().toISOString().split('T')[0]
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingProject ? 'Update' : 'Create'} Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {allProjects === undefined ? (
        <SkeletonList count={4} />
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {allProjects.length === 0 
              ? "No projects yet. Create your first project!" 
              : "No projects match your filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      ) : (
        <>
          {filteredProjects.length > PERFORMANCE_LIMITS.projectsPage.maxVisible ? (
            // Use virtual scrolling for very large lists
            <VirtualizedList
              items={pagination.items}
              itemHeight={200}
              containerHeight={600}
              renderItem={(project) => (
                <div className="p-2">
                  <MemoizedProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    statuses={statuses}
                    priorities={priorities}
                  />
                </div>
              )}
            />
          ) : (
            // Regular grid for smaller lists
            <div className="responsive-grid">
              {pagination.items.map((project) => (
                <MemoizedProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  statuses={statuses}
                  priorities={priorities}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={pagination.goToPage}
            totalItems={pagination.totalItems}
            itemsPerPage={PERFORMANCE_LIMITS.projectsPage.itemsPerPage}
          />
        </>
      )}
    </div>
  );
};

export default ProjectManager;