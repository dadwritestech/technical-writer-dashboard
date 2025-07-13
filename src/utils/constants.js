// Performance and UI constants

export const PERFORMANCE_LIMITS = {
  dashboard: {
    recentProjects: 5,
    todayTimeBlocks: 20,
    documentationDebt: 10,
    maxStatsCalculation: 1000 // Max time blocks to process for stats
  },
  projectsPage: {
    itemsPerPage: 20,
    maxVisible: 100, // Virtual scrolling threshold
    searchDebounce: 300 // ms
  },
  timeTracker: {
    recentSessions: 50,
    historyDays: 30,
    maxSessionsDisplay: 20
  },
  weeklyReport: {
    maxWeeks: 4,
    topProjects: 10,
    maxTimeBlocks: 500
  },
  general: {
    animationDuration: 300,
    toastDuration: 4000,
    autoSaveDelay: 1000
  }
};

export const VIRTUAL_SCROLL_CONFIG = {
  itemHeight: 120,
  containerHeight: 600,
  overscan: 5,
  threshold: 200
};

export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxVisiblePages: 5
};

export const CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // Maximum cached items
  cleanup: 60 * 1000 // Cleanup interval
};