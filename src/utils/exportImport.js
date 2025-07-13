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