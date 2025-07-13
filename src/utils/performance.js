// Performance optimization utilities
import React from 'react';

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Chunk large arrays for processing
export const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Process large datasets in chunks to prevent blocking
export const processInChunks = async (items, processor, chunkSize = 100) => {
  const chunks = chunkArray(items, chunkSize);
  const results = [];
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    // Allow other tasks to run
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};

// Measure performance of functions
export const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    };
  }
  return null;
};

// Database query optimization helpers
export const optimizeQuery = {
  // Limit results for dashboard widgets
  limitForDashboard: 10,
  limitForLists: 50,
  limitForInfiniteScroll: 20,
  
  // Date range helpers for efficient queries
  getTodayRange: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { start: today, end: tomorrow };
  },
  
  getWeekRange: (date = new Date()) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    
    return { start, end };
  },
  
  getMonthRange: (date = new Date()) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { start, end };
  }
};

// Performance monitoring and metrics collection
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.threshold = 100; // ms threshold for slow operations
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing an operation
  startTiming(operationName) {
    if (!this.isEnabled) return null;
    
    const id = `${operationName}_${Date.now()}_${Math.random()}`;
    this.metrics.set(id, {
      name: operationName,
      startTime: performance.now(),
      startMemory: this.getMemorySnapshot()
    });
    return id;
  }

  // End timing and log if needed
  endTiming(timingId) {
    if (!this.isEnabled || !timingId || !this.metrics.has(timingId)) return null;
    
    const metric = this.metrics.get(timingId);
    const duration = performance.now() - metric.startTime;
    const endMemory = this.getMemorySnapshot();
    
    const result = {
      name: metric.name,
      duration: Math.round(duration * 100) / 100,
      memoryDelta: endMemory ? (endMemory.used - metric.startMemory?.used) : 0,
      timestamp: new Date().toISOString()
    };

    // Log slow operations
    if (duration > this.threshold) {
      console.warn(`⚠️ Slow operation detected: ${metric.name} took ${result.duration}ms`);
    }

    // Clean up
    this.metrics.delete(timingId);
    
    return result;
  }

  // Get memory snapshot
  getMemorySnapshot() {
    return getMemoryUsage();
  }

  // Monitor component render time
  measureComponentRender(componentName, renderFn) {
    const timingId = this.startTiming(`${componentName}_render`);
    try {
      const result = renderFn();
      this.endTiming(timingId);
      return result;
    } catch (error) {
      this.endTiming(timingId);
      throw error;
    }
  }

  // Monitor database operations
  measureDbOperation(operationName, operation) {
    return async (...args) => {
      const timingId = this.startTiming(`db_${operationName}`);
      try {
        const result = await operation(...args);
        const metrics = this.endTiming(timingId);
        
        // Log database operations that take too long
        if (metrics && metrics.duration > 50) {
          console.warn(`🐌 Slow DB operation: ${operationName} took ${metrics.duration}ms`);
        }
        
        return result;
      } catch (error) {
        this.endTiming(timingId);
        throw error;
      }
    };
  }

  // Get current performance stats
  getStats() {
    const activeMetrics = Array.from(this.metrics.values());
    const memory = this.getMemorySnapshot();
    
    return {
      activeOperations: activeMetrics.length,
      memory,
      timestamp: new Date().toISOString()
    };
  }

  // Report performance summary
  generateReport() {
    const memory = this.getMemorySnapshot();
    const activeOps = this.metrics.size;
    
    console.group('📊 Performance Report');
    console.log('Active operations:', activeOps);
    if (memory) {
      console.log(`Memory usage: ${memory.used}MB / ${memory.limit}MB (${Math.round((memory.used / memory.limit) * 100)}%)`);
    }
    console.groupEnd();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = (operationName, operation) => {
    return performanceMonitor.measureDbOperation(operationName, operation);
  };

  const timing = (operationName) => {
    const timingId = performanceMonitor.startTiming(operationName);
    return () => performanceMonitor.endTiming(timingId);
  };

  const getStats = () => performanceMonitor.getStats();

  return { monitor, timing, getStats };
};

// Utility to measure React component performance
export const withPerformanceMonitoring = (Component, componentName) => {
  const WrappedComponent = React.forwardRef((props, ref) => {
    return performanceMonitor.measureComponentRender(
      componentName || Component.displayName || Component.name,
      () => React.createElement(Component, { ...props, ref })
    );
  });
  
  WrappedComponent.displayName = `WithPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Browser performance API helpers
export const trackWebVitals = () => {
  if (typeof window === 'undefined') return;

  // First Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log('🎨 First Contentful Paint:', entry.startTime);
      }
    }
  }).observe({ entryTypes: ['paint'] });

  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('🖼️ Largest Contentful Paint:', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('⚡ First Input Delay:', entry.processingStart - entry.startTime);
    }
  }).observe({ entryTypes: ['first-input'] });
};

// Performance budget checker
export const checkPerformanceBudget = (component, actualDuration, budgetMs = 16) => {
  if (actualDuration > budgetMs) {
    console.warn(`🚨 Performance budget exceeded for ${component}: ${actualDuration}ms > ${budgetMs}ms`);
    return false;
  }
  return true;
};