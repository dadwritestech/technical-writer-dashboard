import Dexie from 'dexie';

// Initialize database
export const db = new Dexie('TechWriterDB');

db.version(4).stores({
  timeBlocks: '++id, date, type, contentType, workPhase, startTime, endTime, projectId, projectName, projectTeam',
  projects: '++id, name, team, status, contentType, version, lastUpdated, maintenanceStatus, createdAt',
  weeklySummaries: '++id, weekStart, weekEnd, createdAt',
  preferences: 'key, value',
  activeTimers: '++id, startTime, type, projectId, projectName, projectTeam, description, contentType, status'
});

// Enhanced time block saving with project details
export const saveTimeBlock = async (timeBlock) => {
  // Get project details when saving time block
  let projectName = 'Unknown Project';
  let projectTeam = '';
  
  if (timeBlock.projectId) {
    try {
      const project = await db.projects.get(parseInt(timeBlock.projectId));
      if (project) {
        projectName = project.name;
        projectTeam = project.team;
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  }
  
  return await db.timeBlocks.add({
    ...timeBlock,
    projectName, // Cache project name
    projectTeam, // Cache project team
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

// Enhanced active timer saving
export const saveActiveTimer = async (timer) => {
  // Get project details when saving active timer
  let projectName = 'Unknown Project';
  let projectTeam = '';
  
  if (timer.projectId) {
    try {
      const project = await db.projects.get(parseInt(timer.projectId));
      if (project) {
        projectName = project.name;
        projectTeam = project.team;
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  }
  
  return await db.activeTimers.add({
    ...timer,
    projectName, // Cache project name
    projectTeam, // Cache project team  
    createdAt: new Date().toISOString()
  });
};

export const updateActiveTimer = async (id, updates) => {
  return await db.activeTimers.update(id, updates);
};

export const getActiveTimers = async () => {
  return await db.activeTimers.where('status').equals('active').toArray();
};

export const getAllActiveTimers = async () => {
  return await db.activeTimers.toArray();
};

export const stopActiveTimer = async (timerId) => {
  const timer = await db.activeTimers.get(timerId);
  if (timer) {
    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime) - new Date(timer.startTime)) / 1000 / 60);
    
    // Save as completed time block with cached project info
    await saveTimeBlock({
      type: timer.type,
      projectId: timer.projectId,
      projectName: timer.projectName, // Use cached name
      projectTeam: timer.projectTeam,   // Use cached team
      description: timer.description,
      contentType: timer.contentType,
      date: timer.startTime,
      startTime: timer.startTime,
      endTime: endTime,
      duration: duration,
      status: 'completed'
    });
    
    // Remove from active timers
    await db.activeTimers.delete(timerId);
    
    return { duration, endTime };
  }
};

// Migration function to update existing time blocks
export const migrateTimeBlocks = async () => {
  try {
    const timeBlocks = await db.timeBlocks.toArray();
    const projects = await db.projects.toArray();
    
    console.log(`Migrating ${timeBlocks.length} time blocks...`);
    
    for (const block of timeBlocks) {
      if (block.projectId && !block.projectName) {
        const project = projects.find(p => p.id === parseInt(block.projectId));
        if (project) {
          await db.timeBlocks.update(block.id, {
            projectName: project.name,
            projectTeam: project.team
          });
          console.log(`Updated time block ${block.id} with project name: ${project.name}`);
        }
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};