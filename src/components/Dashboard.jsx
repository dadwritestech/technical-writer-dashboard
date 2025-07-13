import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import { db } from '../utils/storage';
import { formatDuration, formatDate } from '../utils/dateHelpers';
import { useTimeTracking } from '../hooks/useTimeTracking';

const Dashboard = () => {
  const { currentBlock, elapsedTime, isActive } = useTimeTracking();
  const [todayStats, setTodayStats] = useState({
    totalMinutes: 0,
    deepWorkMinutes: 0,
    completedTasks: 0
  });

  // Get today's time blocks
  const todayBlocks = useLiveQuery(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db.timeBlocks
      .where('date')
      .between(today.toISOString(), tomorrow.toISOString())
      .toArray();
  }, []);

  // Get active projects
  const activeProjects = useLiveQuery(
    () => db.projects.where('status').notEqual('archived').toArray(),
    []
  );

  // Calculate today's stats
  useEffect(() => {
    if (todayBlocks) {
      const stats = todayBlocks.reduce((acc, block) => {
        if (block.duration) {
          acc.totalMinutes += block.duration;
          if (block.type === 'deep-work') {
            acc.deepWorkMinutes += block.duration;
          }
          if (block.status === 'completed') {
            acc.completedTasks += 1;
          }
        }
        return acc;
      }, { totalMinutes: 0, deepWorkMinutes: 0, completedTasks: 0 });
      
      setTodayStats(stats);
    }
  }, [todayBlocks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">{formatDate(new Date())}</p>
        </div>
        {isActive && currentBlock && (
          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 animate-pulse" />
            <span>Active: {formatDuration(Math.floor(elapsedTime / 60))}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Time Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(todayStats.totalMinutes)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deep Work</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(todayStats.deepWorkMinutes)}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayStats.completedTasks}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeProjects?.length || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Today's Time Blocks</h3>
          {todayBlocks && todayBlocks.length > 0 ? (
            <div className="space-y-2">
              {todayBlocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-8 rounded ${
                      block.type === 'deep-work' ? 'bg-purple-500' :
                      block.type === 'meeting' ? 'bg-green-500' :
                      block.type === 'planning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{block.description || block.type}</p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(block.duration || 0)}
                      </p>
                    </div>
                  </div>
                  {block.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No time blocks recorded yet today.</p>
          )}
          <Link
            to="/time"
            className="mt-4 block text-center btn-primary"
          >
            Start Time Tracking
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Active Projects</h3>
          {activeProjects && activeProjects.length > 0 ? (
            <div className="space-y-2">
              {activeProjects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-gray-600">
                      {project.team} • {project.status}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
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
            <p className="text-gray-500">No active projects.</p>
          )}
          <Link
            to="/projects"
            className="mt-4 block text-center btn-primary"
          >
            Manage Projects
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/time"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Clock className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">Start Timer</span>
          </Link>
          <Link
            to="/projects"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FolderOpen className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">New Project</span>
          </Link>
          <Link
            to="/weekly"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">Weekly Report</span>
          </Link>
          <Link
            to="/settings"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Calendar className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">Schedule</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;