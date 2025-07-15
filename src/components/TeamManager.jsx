import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Plus, 
  Edit2, 
  Archive, 
  Users,
  Folder,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { db, saveTeam, updateTeam, getActiveTeams, getAllTeams } from '../utils/storage';
import { formatDate, formatDuration } from '../utils/dateHelpers';
import { SkeletonList } from './SkeletonCard';
import toast from 'react-hot-toast';

const TeamManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' or 'dashboard'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lead: '',
    status: 'active',
    color: 'blue'
  });

  // Get all teams
  const teams = useLiveQuery(
    () => db.teams.reverse().toArray(),
    []
  );

  // Get team project counts and stats
  const teamStats = useLiveQuery(async () => {
    if (!teams) return {};
    
    const stats = {};
    for (const team of teams) {
      const projectCount = await db.projects
        .where('team')
        .equals(team.name)
        .count();
      
      const activeProjectCount = await db.projects
        .where('team')
        .equals(team.name)
        .and(project => project.status !== 'archived')
        .count();

      // Get time tracking data for this team
      const timeBlocks = await db.timeBlocks
        .where('projectTeam')
        .equals(team.name)
        .toArray();

      const totalTime = timeBlocks.reduce((acc, block) => acc + (block.duration || 0), 0);
      
      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentBlocks = timeBlocks.filter(block => 
        new Date(block.startTime) >= thirtyDaysAgo
      );
      const recentTime = recentBlocks.reduce((acc, block) => acc + (block.duration || 0), 0);

      stats[team.id] = {
        totalProjects: projectCount,
        activeProjects: activeProjectCount,
        totalTime,
        recentTime,
        recentBlocks: recentBlocks.length
      };
    }
    return stats;
  }, [teams]);

  const teamColors = [
    { value: 'blue', label: 'Blue', bgClass: 'bg-blue-100', textClass: 'text-blue-700', borderClass: 'border-blue-500' },
    { value: 'green', label: 'Green', bgClass: 'bg-green-100', textClass: 'text-green-700', borderClass: 'border-green-500' },
    { value: 'purple', label: 'Purple', bgClass: 'bg-purple-100', textClass: 'text-purple-700', borderClass: 'border-purple-500' },
    { value: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', borderClass: 'border-yellow-500' },
    { value: 'red', label: 'Red', bgClass: 'bg-red-100', textClass: 'text-red-700', borderClass: 'border-red-500' },
    { value: 'indigo', label: 'Indigo', bgClass: 'bg-indigo-100', textClass: 'text-indigo-700', borderClass: 'border-indigo-500' },
    { value: 'pink', label: 'Pink', bgClass: 'bg-pink-100', textClass: 'text-pink-700', borderClass: 'border-pink-500' },
    { value: 'teal', label: 'Teal', bgClass: 'bg-teal-100', textClass: 'text-teal-700', borderClass: 'border-teal-500' }
  ];

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Team name is required');
    }
    
    // Check for duplicate team names (excluding current team when editing)
    if (teams) {
      const duplicateTeam = teams.find(team => 
        team.name.toLowerCase() === formData.name.toLowerCase() && 
        (!editingTeam || team.id !== editingTeam.id)
      );
      if (duplicateTeam) {
        errors.push('A team with this name already exists');
      }
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
      if (editingTeam) {
        await updateTeam(editingTeam.id, formData);
        toast.success('Team updated successfully');
      } else {
        await saveTeam(formData);
        toast.success('Team created successfully');
      }
      
      resetForm();
    } catch (error) {
      toast.error('Failed to save team');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      lead: '',
      status: 'active',
      color: 'blue'
    });
    setShowAddForm(false);
    setEditingTeam(null);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      lead: team.lead || '',
      status: team.status,
      color: team.color || 'blue'
    });
    setShowAddForm(true);
  };

  const handleArchive = async (teamId) => {
    const team = teams.find(t => t.id === teamId);
    const stats = teamStats?.[teamId];
    
    if (stats?.activeProjects > 0) {
      toast.error(`Cannot archive team with ${stats.activeProjects} active projects`);
      return;
    }
    
    const confirmed = window.confirm(
      `Are you sure you want to archive "${team.name}"? This action can be undone later.`
    );
    
    if (confirmed) {
      await updateTeam(teamId, { status: 'archived' });
      toast.success('Team archived');
    }
  };

  const getColorClasses = (color) => {
    const colorObj = teamColors.find(c => c.value === color);
    return colorObj || teamColors[0];
  };

  // Team Dashboard Data
  const dashboardData = useMemo(() => {
    if (!teams || !teamStats) return null;

    const activeTeams = teams.filter(t => t.status === 'active');
    const totalProjects = Object.values(teamStats).reduce((acc, stats) => acc + stats.totalProjects, 0);
    const totalActiveProjects = Object.values(teamStats).reduce((acc, stats) => acc + stats.activeProjects, 0);
    const totalTime = Object.values(teamStats).reduce((acc, stats) => acc + stats.totalTime, 0);
    const totalRecentTime = Object.values(teamStats).reduce((acc, stats) => acc + stats.recentTime, 0);

    const topPerformingTeams = activeTeams
      .map(team => ({
        ...team,
        stats: teamStats[team.id] || {}
      }))
      .sort((a, b) => b.stats.recentTime - a.stats.recentTime)
      .slice(0, 5);

    return {
      activeTeams: activeTeams.length,
      totalProjects,
      totalActiveProjects,
      totalTime,
      totalRecentTime,
      topPerformingTeams
    };
  }, [teams, teamStats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Team Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage teams and track productivity across your organization
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'teams'
                  ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Teams
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
          </div>
          {activeTab === 'teams' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Team</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'teams' ? (
        <>
          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                {editingTeam ? 'Edit Team' : 'New Team'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                      placeholder="e.g., Frontend Team, API Documentation Team"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team Lead
                    </label>
                    <input
                      type="text"
                      value={formData.lead}
                      onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-800 dark:text-gray-200"
                      placeholder="Team lead name"
                    />
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
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team Color
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {teamColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.color === color.value
                              ? `${color.borderClass} ${color.bgClass}`
                              : 'border-gray-200 dark:border-dark-600 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 mx-auto rounded-full bg-${color.value}-500`}></div>
                          <span className="text-xs mt-1 block">{color.label}</span>
                        </button>
                      ))}
                    </div>
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
                      placeholder="Brief description of the team's responsibilities"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingTeam ? 'Update' : 'Create'} Team
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Teams List */}
          {teams === undefined ? (
            <SkeletonList count={3} />
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No teams yet. Create your first team to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => {
                const colorClasses = getColorClasses(team.color);
                const stats = teamStats?.[team.id] || { totalProjects: 0, activeProjects: 0, totalTime: 0, recentTime: 0 };
                
                return (
                  <div key={team.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl ${colorClasses.bgClass} flex items-center justify-center`}>
                          <Users className={`w-6 h-6 ${colorClasses.textClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold truncate">{team.name}</h4>
                          {team.lead && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">Led by {team.lead}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(team)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                          title="Edit team"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(team.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                          title="Archive team"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {team.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-full ${
                          team.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {team.status === 'active' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span className="capitalize">{team.status}</span>
                        </span>
                        
                        {team.createdAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Created {formatDate(team.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Folder className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{stats.totalProjects}</div>
                            <div className="text-gray-500 text-xs">Total Projects</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-primary-500" />
                          <div>
                            <div className="font-medium text-primary-600">{stats.activeProjects}</div>
                            <div className="text-gray-500 text-xs">Active</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{formatDuration(stats.totalTime)}</div>
                            <div className="text-gray-500 text-xs">Total Time</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <div>
                            <div className="font-medium text-green-600">{formatDuration(stats.recentTime)}</div>
                            <div className="text-gray-500 text-xs">Last 30 Days</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        // Team Dashboard View
        <div className="space-y-6">
          {dashboardData && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Teams</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {dashboardData.activeTeams}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {dashboardData.totalProjects}
                      </p>
                      <p className="text-xs text-green-600">{dashboardData.totalActiveProjects} active</p>
                    </div>
                    <Folder className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Time Tracked</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatDuration(dashboardData.totalTime)}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recent Activity</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatDuration(dashboardData.totalRecentTime)}
                      </p>
                      <p className="text-xs text-gray-500">Last 30 days</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Top Performing Teams */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Top Performing Teams (Last 30 Days)</h3>
                <div className="space-y-3">
                  {dashboardData.topPerformingTeams.map((team, index) => {
                    const colorClasses = getColorClasses(team.color);
                    const stats = team.stats;
                    
                    return (
                      <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg ${colorClasses.bgClass} flex items-center justify-center`}>
                            <Users className={`w-5 h-5 ${colorClasses.textClass}`} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{team.name}</span>
                              <span className="text-sm text-gray-500">#{index + 1}</span>
                            </div>
                            {team.lead && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">Led by {team.lead}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">{formatDuration(stats.recentTime)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.activeProjects} active projects
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamManager;