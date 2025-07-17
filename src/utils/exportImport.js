import { saveAs } from 'file-saver';
import { db, saveTeam } from './storage';
import toast from 'react-hot-toast';

export const exportData = async () => {
  try {
    // Export ALL tables from the database
    const timeBlocks = await db.timeBlocks.toArray();
    const projects = await db.projects.toArray();
    const teams = await db.teams.toArray();
    const activeTimers = await db.activeTimers.toArray();
    const weeklySummaries = await db.weeklySummaries.toArray();
    const preferences = await db.preferences.toArray();
    
    // Also export theme preference from localStorage
    const themePreference = localStorage.getItem('theme');
    
    const exportData = {
      version: '2.0', // Updated version to reflect new structure
      exportDate: new Date().toISOString(),
      appVersion: '2.0.0', // Add app version for future compatibility
      data: {
        timeBlocks,
        projects,
        teams,
        activeTimers,
        weeklySummaries,
        preferences
      },
      localStorageData: {
        theme: themePreference,
        lastBackupDate: localStorage.getItem('lastBackupDate')
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
    console.error('Export error:', error);
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
    
    // Check version compatibility
    const importVersion = parseFloat(importedData.version);
    if (importVersion > 2.0) {
      const proceed = window.confirm(
        'This backup was created with a newer version of the app. Some data might not import correctly. Continue anyway?'
      );
      if (!proceed) return;
    }
    
    // Confirm before overwriting
    const confirmed = window.confirm(
      'This will replace all existing data. Are you sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    // Show loading toast
    const loadingToast = toast.loading('Importing data...');
    
    try {
      // Clear existing data in the correct order (to handle foreign key relationships)
      await db.activeTimers.clear();
      await db.timeBlocks.clear();
      await db.weeklySummaries.clear();
      await db.preferences.clear();
      await db.projects.clear();
      await db.teams.clear();
      
      // Import teams first (as projects depend on them)
      if (importedData.data.teams) {
        await db.teams.bulkAdd(importedData.data.teams);
      } else if (importVersion < 2.0) {
        // Handle legacy imports without teams - create default teams
        console.log('Legacy import detected - creating default teams');
        await initializeDefaultTeamsForLegacyImport(importedData.data.projects);
      }
      
      // Import projects (after teams exist)
      if (importedData.data.projects) {
        await db.projects.bulkAdd(importedData.data.projects);
      }
      
      // Import time blocks
      if (importedData.data.timeBlocks) {
        await db.timeBlocks.bulkAdd(importedData.data.timeBlocks);
      }
      
      // Import active timers (if any were running during export)
      if (importedData.data.activeTimers) {
        // Optionally ask user if they want to restore active timers
        const restoreTimers = window.confirm(
          'This backup contains active timers. Do you want to restore them as paused timers?'
        );
        
        if (restoreTimers) {
          // Update status to 'paused' to avoid confusion
          const pausedTimers = importedData.data.activeTimers.map(timer => ({
            ...timer,
            status: 'paused'
          }));
          await db.activeTimers.bulkAdd(pausedTimers);
        }
      }
      
      // Import weekly summaries
      if (importedData.data.weeklySummaries) {
        await db.weeklySummaries.bulkAdd(importedData.data.weeklySummaries);
      }
      
      // Import preferences
      if (importedData.data.preferences) {
        await db.preferences.bulkAdd(importedData.data.preferences);
      }
      
      // Restore localStorage data
      if (importedData.localStorageData) {
        if (importedData.localStorageData.theme) {
          localStorage.setItem('theme', importedData.localStorageData.theme);
        }
        if (importedData.localStorageData.lastBackupDate) {
          localStorage.setItem('lastBackupDate', importedData.localStorageData.lastBackupDate);
        }
      }
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Data imported successfully!');
      
      // Reload the page to refresh the UI with new data
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      throw error;
    }
    
  } catch (error) {
    console.error('Import error:', error);
    toast.error('Import failed: ' + error.message);
  }
};

// Helper function to create teams from legacy project data
async function initializeDefaultTeamsForLegacyImport(projects) {
  if (!projects) return;
  
  // Extract unique team names from projects
  const teamNames = [...new Set(projects.map(p => p.team).filter(Boolean))];
  
  // Create teams for each unique team name
  for (const teamName of teamNames) {
    try {
      await db.teams.add({
        name: teamName,
        description: `Imported from legacy backup`,
        status: 'active',
        color: 'gray',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to create team ${teamName}:`, error);
    }
  }
  
  // Also create the default teams if they don't exist
  const defaultTeams = [
    {
      name: 'Documentation Team',
      description: 'Main documentation and content creation team',
      status: 'active',
      color: 'blue'
    },
    {
      name: 'API Team',
      description: 'API documentation and developer resources',
      status: 'active',
      color: 'green'
    },
    {
      name: 'Support Team',
      description: 'User guides and support documentation',
      status: 'active',
      color: 'purple'
    }
  ];
  
  for (const team of defaultTeams) {
    if (!teamNames.includes(team.name)) {
      try {
        await db.teams.add({
          ...team,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to create default team ${team.name}:`, error);
      }
    }
  }
}

// Add a function to validate backup file before import
export const validateBackupFile = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Check required fields
    if (!data.version || !data.data || !data.exportDate) {
      return { valid: false, error: 'Missing required fields in backup file' };
    }
    
    // Check data structure
    const requiredTables = ['timeBlocks', 'projects'];
    for (const table of requiredTables) {
      if (!Array.isArray(data.data[table])) {
        return { valid: false, error: `Invalid or missing ${table} data` };
      }
    }
    
    // Get statistics
    const stats = {
      version: data.version,
      exportDate: new Date(data.exportDate).toLocaleString(),
      projects: data.data.projects?.length || 0,
      teams: data.data.teams?.length || 0,
      timeBlocks: data.data.timeBlocks?.length || 0,
      activeTimers: data.data.activeTimers?.length || 0
    };
    
    return { valid: true, stats };
    
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format' };
  }
};

// Add an export summary function for user transparency
export const getExportSummary = async () => {
  try {
    const counts = {
      timeBlocks: await db.timeBlocks.count(),
      projects: await db.projects.count(),
      teams: await db.teams.count(),
      activeTimers: await db.activeTimers.count(),
      weeklySummaries: await db.weeklySummaries.count(),
      preferences: await db.preferences.count()
    };
    
    const totalSize = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return {
      counts,
      totalRecords: totalSize,
      lastBackup: localStorage.getItem('lastBackupDate')
    };
  } catch (error) {
    console.error('Error getting export summary:', error);
    return null;
  }
};