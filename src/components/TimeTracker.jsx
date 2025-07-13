import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Play, 
  Pause, 
  Square, 
  Clock,
  Coffee,
  Monitor,
  Users,
  Calendar,
  Search,
  Edit,
  FileText,
  Upload,
  Settings
} from 'lucide-react';
import { db } from '../utils/storage';
import { formatDuration, formatTime } from '../utils/dateHelpers';
import { useTimeTracking } from '../hooks/useTimeTracking';
import { contentTypes, workPhases, getContentTypeByValue, getWorkPhaseByValue } from '../utils/contentTypes';
import toast from 'react-hot-toast';

const TimeTracker = () => {
  const {
    currentBlock,
    elapsedTime,
    isActive,
    startTimeBlock,
    endTimeBlock,
    pauseTimeBlock,
    resumeTimeBlock
  } = useTimeTracking();

  const [selectedType, setSelectedType] = useState('writing');
  const [selectedContentType, setSelectedContentType] = useState('user-guides');
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');

  // Get active projects for dropdown
  const activeProjects = useLiveQuery(
    () => db.projects.where('status').notEqual('archived').toArray(),
    []
  );

  // Get today's time blocks
  const todayBlocks = useLiveQuery(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db.timeBlocks
      .where('date')
      .between(today.toISOString(), tomorrow.toISOString())
      .reverse()
      .toArray();
  }, []);

  const timeBlockTypes = workPhases.map(phase => ({
    value: phase.value,
    label: phase.label,
    icon: phase.value === 'research' ? Search :
          phase.value === 'writing' ? Edit :
          phase.value === 'review-editing' ? FileText :
          phase.value === 'version-updates' ? Upload :
          phase.value === 'publishing' ? Monitor :
          Settings,
    color: phase.color
  }));

  const validateTimeTracker = () => {
    const errors = [];
    
    if (!selectedProject) {
      errors.push('Please select a project');
    }
    
    if (!description.trim()) {
      errors.push('Please provide a task description');
    }
    
    return errors;
  };

  const handleStart = () => {
    const validationErrors = validateTimeTracker();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }
    
    startTimeBlock(selectedType, selectedProject, description, selectedContentType);
    setDescription('');
  };

  const handleStop = () => {
    endTimeBlock();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>

      {/* Timer Display */}
      <div className="card text-center">
        <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
          {formatDuration(Math.floor(elapsedTime / 60))}
        </div>
        
        {currentBlock ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              {currentBlock.description || currentBlock.type}
            </p>
            <div className="flex justify-center space-x-4">
              {isActive ? (
                <button
                  onClick={pauseTimeBlock}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeTimeBlock}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              )}
              <button
                onClick={handleStop}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Work Phase Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Phase</label>
              <div className="grid grid-cols-3 gap-2">
                {timeBlockTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedType === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 mx-auto mb-1 ${
                      selectedType === type.value
                        ? `text-${type.color}-600`
                        : 'text-gray-600'
                    }`} />
                    <span className="text-xs text-center">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-describedby="project-error"
                required
              >
                <option value="">Select a project...</option>
                {activeProjects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.team})
                  </option>
                ))}
              </select>
              {!selectedProject && (
                <p id="project-error" className="mt-1 text-sm text-red-600">Project selection is required</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What specific task are you working on?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-describedby="description-error"
                required
              />
              {!description.trim() && (
                <p id="description-error" className="mt-1 text-sm text-red-600">Task description is required</p>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="btn-primary flex items-center justify-center space-x-2 w-full"
            >
              <Play className="w-5 h-5" />
              <span>Start Timer</span>
            </button>
          </div>
        )}
      </div>

      {/* Today's Time Blocks */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Today's Sessions</h3>
        {todayBlocks && todayBlocks.length > 0 ? (
          <div className="space-y-3">
            {todayBlocks.map((block) => {
              const workPhase = getWorkPhaseByValue(block.type);
              const contentType = getContentTypeByValue(block.contentType);
              const typeIcon = workPhase.value === 'research' ? Search :
                              workPhase.value === 'writing' ? Edit :
                              workPhase.value === 'review-editing' ? FileText :
                              workPhase.value === 'version-updates' ? Upload :
                              workPhase.value === 'publishing' ? Monitor :
                              Settings;
              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${workPhase.color}-100 rounded-lg`}>
                      {React.createElement(typeIcon, { className: `w-5 h-5 text-${workPhase.color}-600` })}
                    </div>
                    <div>
                      <p className="font-medium">
                        {block.description || `${workPhase.label} - ${contentType.label}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {contentType.icon} {contentType.label} • {formatTime(block.startTime)} - {
                          block.endTime ? formatTime(block.endTime) : 'In progress'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatDuration(block.duration || 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {workPhase.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No time blocks recorded today yet.</p>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;