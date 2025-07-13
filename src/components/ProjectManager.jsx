import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Edit2, 
  Archive, 
  CheckCircle,
  Clock,
  AlertCircle,
  Folder
} from 'lucide-react';
import { db, saveProject, updateProject } from '../utils/storage';
import { formatDate } from '../utils/dateHelpers';
import toast from 'react-hot-toast';

const ProjectManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    dueDate: ''
  });

  // Get all projects
  const projects = useLiveQuery(
    () => db.projects.reverse().toArray(),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
        toast.success('Project updated successfully');
      } else {
        await saveProject(formData);
        toast.success('Project created successfully');
      }
      
      setFormData({
        name: '',
        team: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        dueDate: ''
      });
      setShowAddForm(false);
      setEditingProject(null);
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      team: project.team,
      description: project.description || '',
      status: project.status,
      priority: project.priority || 'medium',
      dueDate: project.dueDate || ''
    });
    setShowAddForm(true);
  };

  const handleArchive = async (projectId) => {
    await updateProject(projectId, { status: 'archived' });
    toast.success('Project archived');
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team
                </label>
                <select
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select team...</option>
                  {teams.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    dueDate: ''
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects?.map((project) => {
          const StatusIcon = getStatusIcon(project.status);
          const statusColor = getStatusColor(project.status);
          const priorityColor = getPriorityColor(project.priority);
          
          return (
            <div key={project.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.team}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleArchive(project.id)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`flex items-center space-x-1 text-sm px-2 py-1 bg-${statusColor}-100 text-${statusColor}-700 rounded`}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{statuses.find(s => s.value === project.status)?.label}</span>
                  </span>
                  
                  <span className={`text-sm px-2 py-1 bg-${priorityColor}-100 text-${priorityColor}-700 rounded`}>
                    {priorities.find(p => p.value === project.priority)?.label}
                  </span>
                </div>

                {project.dueDate && (
                  <p className="text-sm text-gray-600">
                    Due: {formatDate(project.dueDate)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!projects || projects.length === 0) && !showAddForm && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No projects yet. Create your first project!</p>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;