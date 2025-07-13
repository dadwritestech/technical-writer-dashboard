import Dexie from 'dexie';

// Initialize database
export const db = new Dexie('TechWriterDB');

db.version(2).stores({
  timeBlocks: '++id, date, type, contentType, workPhase, startTime, endTime, projectId',
  projects: '++id, name, team, status, contentType, version, lastUpdated, maintenanceStatus, createdAt',
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