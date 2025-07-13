import React, { memo } from 'react';
import { Edit2, Archive, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/dateHelpers';
import { getContentTypeByValue, getVersionByValue, getMaintenanceStatusByValue, calculateMaintenanceStatus } from '../utils/contentTypes';

const ProjectCard = memo(({ 
  project, 
  onEdit, 
  onArchive, 
  getStatusIcon, 
  getStatusColor, 
  getPriorityColor, 
  statuses, 
  priorities 
}) => {
  const StatusIcon = getStatusIcon(project.status);
  const statusColor = getStatusColor(project.status);
  const priorityColor = getPriorityColor(project.priority);
  const contentType = getContentTypeByValue(project.contentType);
  const version = getVersionByValue(project.version);
  const maintenance = getMaintenanceStatusByValue(
    project.maintenanceStatus || calculateMaintenanceStatus(project.lastUpdated)
  );

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-lg font-semibold">{project.name}</h4>
            <span className="text-lg">{contentType.icon}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{project.team} • {contentType.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{version.label}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="Edit project"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onArchive(project.id)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            aria-label="Archive project"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{project.description}</p>
      )}

      {/* Maintenance Status Alert */}
      {(maintenance.value === 'outdated' || maintenance.value === 'critical') && (
        <div className={`flex items-center space-x-2 p-2 mb-3 rounded-lg bg-${maintenance.color}-50 border border-${maintenance.color}-200`}>
          <AlertTriangle className={`w-4 h-4 text-${maintenance.color}-600`} />
          <span className={`text-sm text-${maintenance.color}-700`}>
            Documentation Debt: {maintenance.label}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`flex items-center space-x-1 text-sm px-2 py-1 bg-${statusColor}-100 text-${statusColor}-700 rounded`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statuses.find(s => s.value === project.status)?.label}</span>
            </span>
            
            <span className={`text-sm px-2 py-1 bg-${priorityColor}-100 text-${priorityColor}-700 rounded`}>
              {priorities.find(p => p.value === project.priority)?.label}
            </span>
          </div>

          {project.dueDate && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Due: {formatDate(project.dueDate)}
            </p>
          )}
        </div>

        {project.lastUpdated && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Last updated: {formatDate(project.lastUpdated)}</span>
            <span className={`px-2 py-1 rounded bg-${maintenance.color}-100 text-${maintenance.color}-700`}>
              {maintenance.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;