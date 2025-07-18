import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Target,
  FolderOpen,
  FileText,
  AlertTriangle,
  Search,
  Edit,
  Settings
} from 'lucide-react';
import { db } from '../utils/storage';
import { formatDuration, formatDate } from '../utils/dateHelpers';
import { useTimeTracking } from '../hooks/useTimeTracking';
import { getContentTypeByValue, getWorkPhaseByValue, calculateMaintenanceStatus } from '../utils/contentTypes';
import { useOptimizedDashboardData } from '../hooks/useOptimizedQuery';
import { useTimer } from '../contexts/TimerContext';
import LoadingSpinner from './LoadingSpinner';
import { SkeletonList } from './SkeletonCard';

const Dashboard = () => {
  const { activeTimers, getFormattedElapsedTime } = useTimer();
  const [todayStats, setTodayStats] = useState({
    totalMinutes: 0,
    researchMinutes: 0,
    writingMinutes: 0,
    completedTasks: 0
  });

  // Get optimized dashboard data
  const { todayBlocks, recentActiveProjects, documentationDebt } = useOptimizedDashboardData();

  // Calculate today's stats with memoization
  const todayStatsCalculated = useMemo(() => {
    if (!todayBlocks) return { totalMinutes: 0, researchMinutes: 0, writingMinutes: 0, completedTasks: 0 };
    
    return todayBlocks.reduce((acc, block) => {
      if (block.duration) {
        acc.totalMinutes += block.duration;
        if (block.type === 'research') {
          acc.researchMinutes += block.duration;
        }
        if (block.type === 'writing') {
          acc.writingMinutes += block.duration;
        }
        if (block.status === 'completed') {
          acc.completedTasks += 1;
        }
      }
      return acc;
    }, { totalMinutes: 0, researchMinutes: 0, writingMinutes: 0, completedTasks: 0 });
  }, [todayBlocks]);

  useEffect(() => {
    setTodayStats(todayStatsCalculated);
  }, [todayStatsCalculated]);

  // Documentation debt is now pre-calculated in the optimized query

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">{formatDate(new Date())}</p>
        </div>
        {activeTimers && activeTimers.length > 0 && (
          <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 animate-pulse" />
            <span>
              {activeTimers.length} Active Timer{activeTimers.length > 1 ? 's' : ''}: {getFormattedElapsedTime(activeTimers[0].startTime)}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="responsive-grid lg:grid-cols-4">
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="responsive-text-sm text-gray-600 dark:text-gray-400 font-medium">Total Time Today</p>
              <p className="text-2xl md:text-3xl font-bold gradient-text mt-2">
                {formatDuration(todayStats.totalMinutes)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                +12% from yesterday
              </p>
            </div>
            <div className="stat-icon p-3 md:p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Research Time</p>
              <p className="text-3xl font-bold gradient-text mt-2">
                {formatDuration(todayStats.researchMinutes)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Deep investigation
              </p>
            </div>
            <div className="stat-icon p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Writing Time</p>
              <p className="text-3xl font-bold gradient-text mt-2">
                {formatDuration(todayStats.writingMinutes)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Creative flow
              </p>
            </div>
            <div className="stat-icon p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Edit className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Tasks Completed</p>
              <p className="text-3xl font-bold gradient-text mt-2">
                {todayStats.completedTasks}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Great progress!
              </p>
            </div>
            <div className="stat-icon p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Debt Alert */}
      {documentationDebt && documentationDebt.length > 0 && (
        <div className="debt-alert card border-l-4 border-orange-500 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm animate-slide-up">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl animate-pulse-soft">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300">Documentation Debt Alert</h3>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {documentationDebt.length} document{documentationDebt.length > 1 ? 's need' : ' needs'} immediate attention
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {documentationDebt.slice(0, 3).map((project, index) => {
              const contentType = getContentTypeByValue(project.contentType);
              const maintenance = calculateMaintenanceStatus(project.lastUpdated);
              return (
                <div 
                  key={project.id} 
                  className="flex items-center justify-between p-4 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl border border-orange-200/50 dark:border-orange-700/30 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{contentType.icon}</span>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{contentType.label}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    maintenance === 'critical' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                  }`}>
                    {maintenance === 'critical' ? '🚨 Critical' : '⚠️ Outdated'}
                  </span>
                </div>
              );
            })}
          </div>
          
          {documentationDebt.length > 3 && (
            <div className="mt-4 p-3 bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm rounded-xl border border-orange-200/30 dark:border-orange-700/20">
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                📚 +{documentationDebt.length - 3} more documents need updates
              </p>
            </div>
          )}
          
          <Link to="/projects" className="btn-primary mt-6 inline-flex items-center space-x-2 glow-effect">
            <span>Review Documentation Debt</span>
            <AlertTriangle className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Today's Time Blocks</h3>
          {todayBlocks === undefined ? (
            <LoadingSpinner text="Loading time blocks..." />
          ) : todayBlocks && todayBlocks.length > 0 ? (
            <div className="space-y-2">
              {todayBlocks.map((block) => {
                const workPhase = getWorkPhaseByValue(block.type);
                const contentType = getContentTypeByValue(block.contentType);
                return (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-8 rounded bg-${workPhase.color}-500`} />
                      <div>
                        <p className="font-medium">
                          {block.description || `${workPhase.label} - ${contentType.label}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {contentType.icon} {contentType.label} • {formatDuration(block.duration || 0)}
                        </p>
                      </div>
                    </div>
                    {block.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No time blocks recorded yet today.</p>
          )}
          <Link
            to="/time"
            className="mt-4 block text-center btn-primary"
          >
            Start Time Tracking
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
          {recentActiveProjects === undefined ? (
            <LoadingSpinner text="Loading projects..." />
          ) : recentActiveProjects && recentActiveProjects.length > 0 ? (
            <div className="space-y-2">
              {recentActiveProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.team} • {project.status}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {project.progress || 0}%
                    </span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No recent projects.</p>
          )}
          <Link
            to="/projects"
            className="mt-4 block text-center btn-primary"
          >
            View All Projects
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/time"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
          >
            <Clock className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">Start Timer</span>
          </Link>
          <Link
            to="/projects"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
          >
            <FolderOpen className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">New Project</span>
          </Link>
          <Link
            to="/weekly"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
          >
            <FileText className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">Weekly Report</span>
          </Link>
          <Link
            to="/settings"
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
          >
            <Settings className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;