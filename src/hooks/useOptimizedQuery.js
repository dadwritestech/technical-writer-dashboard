import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../utils/storage';
import { PERFORMANCE_LIMITS } from '../utils/constants';
import { calculateMaintenanceStatus } from '../utils/contentTypes';

export const useOptimizedDashboardData = () => {
  // Optimized today's time blocks - limit to recent ones
  const todayBlocks = useLiveQuery(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db.timeBlocks
      .where('date')
      .between(today.toISOString(), tomorrow.toISOString())
      .limit(PERFORMANCE_LIMITS.dashboard.todayTimeBlocks)
      .reverse()
      .toArray();
  }, []);

  // Optimized active projects - only show recent ones
  const recentActiveProjects = useLiveQuery(async () => {
    return await db.projects
      .where('status')
      .notEqual('archived')
      .limit(PERFORMANCE_LIMITS.dashboard.recentProjects)
      .reverse()
      .toArray();
  }, []);

  // Documentation debt projects - limited and indexed
  const documentationDebt = useLiveQuery(async () => {
    const allProjects = await db.projects
      .where('status')
      .notEqual('archived')
      .toArray();
    
    // Process in chunks to avoid blocking
    const debt = [];
    const chunkSize = 50;
    
    for (let i = 0; i < allProjects.length && debt.length < PERFORMANCE_LIMITS.dashboard.documentationDebt; i += chunkSize) {
      const chunk = allProjects.slice(i, i + chunkSize);
      
      for (const project of chunk) {
        if (debt.length >= PERFORMANCE_LIMITS.dashboard.documentationDebt) break;
        
        const maintenance = calculateMaintenanceStatus(project.lastUpdated);
        if (maintenance === 'outdated' || maintenance === 'critical') {
          debt.push({ ...project, maintenanceStatus: maintenance });
        }
      }
      
      // Yield to browser
      if (i + chunkSize < allProjects.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return debt;
  }, []);

  return {
    todayBlocks,
    recentActiveProjects,
    documentationDebt
  };
};

export const useOptimizedProjectsList = (page = 0, pageSize = PERFORMANCE_LIMITS.projectsPage.itemsPerPage, filters = {}) => {
  return useLiveQuery(async () => {
    let query = db.projects;
    
    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.where('status').equals(filters.status);
    }
    
    if (filters.team && filters.team !== 'all') {
      query = query.where('team').equals(filters.team);
    }
    
    // Get total count for pagination
    const totalCount = await query.count();
    
    // Get paginated results
    const items = await query
      .offset(page * pageSize)
      .limit(pageSize)
      .reverse()
      .toArray();
    
    return {
      items,
      totalCount,
      hasMore: (page + 1) * pageSize < totalCount,
      page,
      pageSize
    };
  }, [page, pageSize, JSON.stringify(filters)]);
};

export const useOptimizedTimeBlocks = (dateRange, limit = PERFORMANCE_LIMITS.timeTracker.recentSessions) => {
  return useLiveQuery(async () => {
    if (!dateRange) return [];
    
    return await db.timeBlocks
      .where('date')
      .between(dateRange.start.toISOString(), dateRange.end.toISOString())
      .limit(limit)
      .reverse()
      .toArray();
  }, [dateRange?.start?.toISOString(), dateRange?.end?.toISOString(), limit]);
};

export const useOptimizedWeeklyData = (weekRange) => {
  const result = useLiveQuery(async () => {
    if (!weekRange) return { timeBlocks: [], projects: [] };
    
    try {
      // Limit time blocks for performance
      const timeBlocks = await db.timeBlocks
        .where('date')
        .between(weekRange.start.toISOString(), weekRange.end.toISOString())
        .limit(PERFORMANCE_LIMITS.weeklyReport.maxTimeBlocks)
        .toArray();
      
      // Get project IDs from time blocks
      const projectIds = [...new Set(timeBlocks.map(block => block.projectId).filter(Boolean))];
      
      // Get only relevant projects
      const projects = projectIds.length > 0 
        ? await db.projects
            .where('id')
            .anyOf(projectIds)
            .toArray()
        : [];
      
      return { timeBlocks, projects };
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      return { timeBlocks: [], projects: [] };
    }
  }, [weekRange?.start?.toISOString(), weekRange?.end?.toISOString()]);

  // Return default value while loading
  return result ?? { timeBlocks: [], projects: [] };
};

