import Dexie from 'dexie';

// Initialize database
export const db = new Dexie('TechWriterDB');

db.version(3).stores({
  timeBlocks: '++id, date, type, contentType, workPhase, startTime, endTime, projectId',
  projects: '++id, name, team, status, contentType, version, lastUpdated, maintenanceStatus, createdAt',
  weeklySummaries: '++id, weekStart, weekEnd, createdAt',
  preferences: 'key, value',
  activeTimers: '++id, startTime, type, projectId, description, contentType, status'
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

// Active timer management
export const saveActiveTimer = async (timer) => {
  return await db.activeTimers.add({
    ...timer,
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
    
    // Save as completed time block
    await saveTimeBlock({
      type: timer.type,
      projectId: timer.projectId,
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