import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  FileText, 
  Mail, 
  Copy,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { db } from '../utils/storage';
import { formatDuration, getWeekRange, formatDate } from '../utils/dateHelpers';
import toast from 'react-hot-toast';

const WeeklySummary = () => {
  const [weekRange, setWeekRange] = useState(getWeekRange());
  const [completedItems, setCompletedItems] = useState(['']);
  const [inProgressItems, setInProgressItems] = useState(['']);
  const [emailSummary, setEmailSummary] = useState('');

  // Get time blocks for the current week
  const weeklyBlocks = useLiveQuery(async () => {
    return await db.timeBlocks
      .where('date')
      .between(weekRange.start.toISOString(), weekRange.end.toISOString())
      .toArray();
  }, [weekRange]);

  // Get projects data
  const projects = useLiveQuery(() => db.projects.toArray(), []);

  // Calculate weekly stats
  const weeklyStats = React.useMemo(() => {
    if (!weeklyBlocks) return { total: 0, deepWork: 0, meetings: 0, planning: 0 };

    return weeklyBlocks.reduce((acc, block) => {
      if (block.duration) {
        acc.total += block.duration;
        switch (block.type) {
          case 'deep-work':
            acc.deepWork += block.duration;
            break;
          case 'meeting':
            acc.meetings += block.duration;
            break;
          case 'planning':
            acc.planning += block.duration;
            break;
        }
      }
      return acc;
    }, { total: 0, deepWork: 0, meetings: 0, planning: 0 });
  }, [weeklyBlocks]);

  // Project time breakdown
  const projectBreakdown = React.useMemo(() => {
    if (!weeklyBlocks || !projects) return [];

    const breakdown = {};
    weeklyBlocks.forEach(block => {
      if (block.projectId && block.duration) {
        if (!breakdown[block.projectId]) {
          breakdown[block.projectId] = 0;
        }
        breakdown[block.projectId] += block.duration;
      }
    });

    return Object.entries(breakdown).map(([projectId, minutes]) => {
      const project = projects.find(p => p.id === parseInt(projectId));
      return {
        projectName: project?.name || 'Unknown Project',
        team: project?.team || '',
        minutes
      };
    }).sort((a, b) => b.minutes - a.minutes);
  }, [weeklyBlocks, projects]);

  const addCompletedItem = () => {
    setCompletedItems([...completedItems, '']);
  };

  const removeCompletedItem = (index) => {
    setCompletedItems(completedItems.filter((_, i) => i !== index));
  };

  const updateCompletedItem = (index, value) => {
    const updated = [...completedItems];
    updated[index] = value;
    setCompletedItems(updated);
  };

  const addInProgressItem = () => {
    setInProgressItems([...inProgressItems, '']);
  };

  const removeInProgressItem = (index) => {
    setInProgressItems(inProgressItems.filter((_, i) => i !== index));
  };

  const updateInProgressItem = (index, value) => {
    const updated = [...inProgressItems];
    updated[index] = value;
    setInProgressItems(updated);
  };

  const generateEmailSummary = () => {
    const completed = completedItems.filter(item => item.trim() !== '');
    const inProgress = inProgressItems.filter(item => item.trim() !== '');

    const summary = `Weekly Summary - ${formatDate(weekRange.start)} to ${formatDate(weekRange.end)}

Time Breakdown:
• Total Time: ${formatDuration(weeklyStats.total)}
• Deep Work: ${formatDuration(weeklyStats.deepWork)}
• Meetings: ${formatDuration(weeklyStats.meetings)}
• Planning: ${formatDuration(weeklyStats.planning)}

Project Time Allocation:
${projectBreakdown.map(p => `• ${p.projectName} (${p.team}): ${formatDuration(p.minutes)}`).join('\n')}

Completed This Week:
${completed.map(item => `• ${item}`).join('\n')}

In Progress:
${inProgress.map(item => `• ${item}`).join('\n')}

Generated on ${formatDate(new Date())}`;

    setEmailSummary(summary);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailSummary);
      toast.success('Summary copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const openInEmail = () => {
    const subject = `Weekly Summary - ${formatDate(weekRange.start)} to ${formatDate(weekRange.end)}`;
    const body = encodeURIComponent(emailSummary);
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`);
  };

  useEffect(() => {
    if (weeklyStats.total > 0) {
      generateEmailSummary();
    }
  }, [weeklyStats, completedItems, inProgressItems, projectBreakdown]);

  const goToPreviousWeek = () => {
    const newStart = new Date(weekRange.start);
    newStart.setDate(newStart.getDate() - 7);
    setWeekRange(getWeekRange(newStart));
  };

  const goToNextWeek = () => {
    const newStart = new Date(weekRange.start);
    newStart.setDate(newStart.getDate() + 7);
    setWeekRange(getWeekRange(newStart));
  };

  const goToCurrentWeek = () => {
    setWeekRange(getWeekRange());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Summary</h2>
        <div className="flex items-center space-x-4">
          <button onClick={goToPreviousWeek} className="btn-secondary">← Previous</button>
          <span className="font-medium">
            {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
          </span>
          <button onClick={goToNextWeek} className="btn-secondary">Next →</button>
          <button onClick={goToCurrentWeek} className="btn-primary">Current Week</button>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(weeklyStats.total)}
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
                {formatDuration(weeklyStats.deepWork)}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Meetings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(weeklyStats.meetings)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Planning</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(weeklyStats.planning)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Project Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Project Time Allocation</h3>
        {projectBreakdown.length > 0 ? (
          <div className="space-y-3">
            {projectBreakdown.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{project.projectName}</p>
                  <p className="text-sm text-gray-600">{project.team}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDuration(project.minutes)}</p>
                  <p className="text-sm text-gray-600">
                    {Math.round((project.minutes / weeklyStats.total) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No time tracked this week.</p>
        )}
      </div>

      {/* Summary Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Completed This Week</h3>
            <button
              onClick={addCompletedItem}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-2">
            {completedItems.map((item, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateCompletedItem(index, e.target.value)}
                  placeholder="What did you complete?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeCompletedItem(index)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">In Progress</h3>
            <button
              onClick={addInProgressItem}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-2">
            {inProgressItems.map((item, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateInProgressItem(index, e.target.value)}
                  placeholder="What are you working on?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={() => removeInProgressItem(index)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Summary */}
      {emailSummary && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Email Summary</h3>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={openInEmail}
                className="btn-primary flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>
          </div>
          <pre className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
            {emailSummary}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WeeklySummary;