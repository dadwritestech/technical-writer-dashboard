import React, { useState, useMemo } from 'react';
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
import { useTimer } from '../contexts/TimerContext';
import { contentTypes, workPhases, getContentTypeByValue, getWorkPhaseByValue } from '../utils/contentTypes';
import { useOptimizedTimeBlocks } from '../hooks/useOptimizedQuery';
import { usePagination } from '../hooks/usePagination';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { PERFORMANCE_LIMITS } from '../utils/constants';
import VirtualizedList from './VirtualizedList';
import Pagination from './Pagination';
import { SkeletonList } from './SkeletonCard';
import toast from 'react-hot-toast';

// Memoized TimeBlock item component for performance
const TimeBlockItem = React.memo(({ block }) => {
  const workPhase = getWorkPhaseByValue(block.type);
  const contentType = getContentTypeByValue(block.contentType);
  const typeIcon = workPhase.value === 'research' ? Search :
                  workPhase.value === 'writing' ? Edit :
                  workPhase.value === 'review-editing' ? FileText :
                  workPhase.value === 'version-updates' ? Upload :
                  workPhase.value === 'publishing' ? Monitor :
                  Settings;
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`p-2 bg-${workPhase.color}-100 rounded-lg`}>
          {React.createElement(typeIcon, { className: `w-5 h-5 text-${workPhase.color}-600` })}
        </div>
        <div>
          <p className="font-medium">
            {block.description || `${workPhase.label} - ${contentType.label}`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {workPhase.label}
        </p>
      </div>
    </div>
  );
});

const TimeTracker = () => {
  const { activeTimers, startTimer, stopTimer, pauseTimer, resumeTimer, getFormattedElapsedTime } = useTimer();

  const [selectedType, setSelectedType] = useState('writing');
  const [selectedContentType, setSelectedContentType] = useState('user-guides');
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Get active projects for dropdown (optimized)
  const activeProjects = useLiveQuery(
    () => db.projects.where('status').notEqual('archived').limit(50).toArray(),
    []
  );

  // Get today's time blocks with optimization
  const todayDateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return { start: today, end: tomorrow };
  }, []);

  const todayBlocks = useOptimizedTimeBlocks(todayDateRange, PERFORMANCE_LIMITS.timeTracker.maxSessionsDisplay);

  // Pagination for today's sessions
  const pagination = usePagination(todayBlocks || [], PERFORMANCE_LIMITS.timeTracker.maxSessionsDisplay);

  // Infinite scroll for historical time blocks
  const fetchHistoricalBlocks = async (page, limit) => {
    const offset = page * limit;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1); // Start from yesterday
    
    return await db.timeBlocks
      .where('date')
      .below(cutoffDate.toISOString())
      .reverse()
      .offset(offset)
      .limit(limit)
      .toArray();
  };

  const {
    data: historicalBlocks,
    loading: loadingHistory,
    hasMore,
    error: historyError,
    handleScroll
  } = useInfiniteScroll(fetchHistoricalBlocks, {
    threshold: 100,
    limit: PERFORMANCE_LIMITS.timeTracker.recentSessions
  });

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

  const handleStart = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please provide a task description');
      return;
    }
    
    try {
      await startTimer(selectedType, selectedProject, description, selectedContentType);
      setDescription('');
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Time Tracking</h2>

      {/* Timer Display */}
      <div className="card text-center">
        {activeTimers && activeTimers.length > 0 ? (
          <div className="space-y-4">
            <div className="text-6xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-4">
              {getFormattedElapsedTime(activeTimers[0].startTime)}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {activeTimers[0].description || `${activeTimers[0].type} - ${activeTimers[0].contentType}`}
            </p>
            <div className="flex justify-center space-x-4">
              {activeTimers[0].status === 'active' ? (
                <button
                  onClick={() => pauseTimer(activeTimers[0].id)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={() => resumeTimer(activeTimers[0].id)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              )}
              <button
                onClick={() => stopTimer(activeTimers[0].id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <Square className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-4">
              0:00
            </div>
            {/* Work Phase Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Phase</label>
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
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <span className="text-xs text-center">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Type</label>
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What specific task are you working on?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Today's Sessions</h3>
          {todayBlocks && todayBlocks.length > PERFORMANCE_LIMITS.timeTracker.maxSessionsDisplay && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {pagination.items.length} of {todayBlocks.length} sessions
            </p>
          )}
        </div>
        
        {todayBlocks === undefined ? (
          <SkeletonList count={3} />
        ) : todayBlocks && todayBlocks.length > 0 ? (
          <>
            {todayBlocks.length > PERFORMANCE_LIMITS.timeTracker.maxSessionsDisplay ? (
              // Use virtual scrolling for large lists
              <VirtualizedList
                items={pagination.items}
                itemHeight={80}
                containerHeight={400}
                renderItem={(block) => <TimeBlockItem key={block.id} block={block} />}
              />
            ) : (
              // Regular rendering for smaller lists
              <div className="space-y-3">
                {pagination.items.map((block) => (
                  <TimeBlockItem key={block.id} block={block} />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {todayBlocks.length > PERFORMANCE_LIMITS.timeTracker.maxSessionsDisplay && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={pagination.goToPage}
                  totalItems={pagination.totalItems}
                  itemsPerPage={PERFORMANCE_LIMITS.timeTracker.maxSessionsDisplay}
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No time blocks recorded today yet.</p>
        )}
      </div>

      {/* Historical Time Blocks Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Time Block History</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
        
        {showHistory && (
          <div>
            {historyError ? (
              <div className="text-red-600 dark:text-red-400 text-center py-4">
                Error loading history: {historyError.message}
              </div>
            ) : historicalBlocks.length === 0 && !loadingHistory ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No historical time blocks found.
              </p>
            ) : (
              <div 
                className="space-y-3 max-h-96 overflow-y-auto"
                onScroll={handleScroll}
              >
                {historicalBlocks.map((block) => (
                  <TimeBlockItem key={block.id} block={block} />
                ))}
                
                {loadingHistory && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Loading more...</span>
                    </div>
                  </div>
                )}
                
                {!hasMore && historicalBlocks.length > 0 && (
                  <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                    No more history to load
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;