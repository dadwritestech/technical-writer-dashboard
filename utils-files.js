// src/utils/storage.js
import Dexie from 'dexie';

// Initialize database
export const db = new Dexie('TechWriterDB');

db.version(1).stores({
  timeBlocks: '++id, date, type, startTime, endTime, projectId',
  projects: '++id, name, team, status, createdAt',
  weeklySummaries: '++id, weekStart, weekEnd, createdAt',
  preferences: 'key, value'
});

// Helper functions
export const saveTimeBlock = async (timeBlock) => {
  return await db.timeBlocks.add({
    ...timeBlock,
    createdAt: new Date().toISOString()
  });
};

export const getTimeBlocksByDate = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await db.timeBlocks
    .where('date')
    .between(startOfDay.toISOString(), endOfDay.toISOString())
    .toArray();
};

export const saveProject = async (project) => {
  return await db.projects.add({
    ...project,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateProject = async (id, updates) => {
  return await db.projects.update(id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const getActiveProjects = async () => {
  return await db.projects
    .where('status')
    .notEqual('archived')
    .toArray();
};

export const savePreference = async (key, value) => {
  return await db.preferences.put({ key, value });
};

export const getPreference = async (key, defaultValue = null) => {
  const pref = await db.preferences.get(key);
  return pref ? pref.value : defaultValue;
};

// ===================================
// src/utils/exportImport.js
import { saveAs } from 'file-saver';
import { db } from './storage';
import toast from 'react-hot-toast';

export const exportData = async () => {
  try {
    const timeBlocks = await db.timeBlocks.toArray();
    const projects = await db.projects.toArray();
    const weeklySummaries = await db.weeklySummaries.toArray();
    const preferences = await db.preferences.toArray();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        timeBlocks,
        projects,
        weeklySummaries,
        preferences
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const fileName = `techwriter-backup-${new Date().toISOString().split('T')[0]}.json`;
    saveAs(blob, fileName);
    
    // Update last backup date
    localStorage.setItem('lastBackupDate', new Date().toISOString());
    toast.success('Data exported successfully!');
  } catch (error) {
    toast.error('Export failed: ' + error.message);
  }
};

export const importData = async (file) => {
  try {
    const text = await file.text();
    const importedData = JSON.parse(text);
    
    // Validate data structure
    if (!importedData.version || !importedData.data) {
      throw new Error('Invalid backup file format');
    }
    
    // Confirm before overwriting
    const confirmed = window.confirm(
      'This will replace all existing data. Are you sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    // Clear existing data
    await db.timeBlocks.clear();
    await db.projects.clear();
    await db.weeklySummaries.clear();
    await db.preferences.clear();
    
    // Import new data
    if (importedData.data.timeBlocks) {
      await db.timeBlocks.bulkAdd(importedData.data.timeBlocks);
    }
    if (importedData.data.projects) {
      await db.projects.bulkAdd(importedData.data.projects);
    }
    if (importedData.data.weeklySummaries) {
      await db.weeklySummaries.bulkAdd(importedData.data.weeklySummaries);
    }
    if (importedData.data.preferences) {
      await db.preferences.bulkAdd(importedData.data.preferences);
    }
    
    toast.success('Data imported successfully!');
    
    // Reload the page to refresh the UI
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    toast.error('Import failed: ' + error.message);
  }
};

// ===================================
// src/utils/dateHelpers.js
import { format, startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatTime = (date) => {
  return format(new Date(date), 'h:mm a');
};

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const getWeekRange = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

export const calculateDuration = (startTime, endTime) => {
  return differenceInMinutes(new Date(endTime), new Date(startTime));
};

export const getTimeBlockType = (type) => {
  const types = {
    'deep-work': { label: 'Deep Work', color: 'bg-purple-500' },
    'shallow-work': { label: 'Shallow Work', color: 'bg-blue-500' },
    'meeting': { label: 'Meeting', color: 'bg-green-500' },
    'planning': { label: 'Planning', color: 'bg-yellow-500' },
    'break': { label: 'Break', color: 'bg-gray-400' }
  };
  return types[type] || { label: type, color: 'bg-gray-500' };
};