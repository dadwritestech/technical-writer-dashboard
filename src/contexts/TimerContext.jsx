import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db, saveActiveTimer, updateActiveTimer, getAllActiveTimers, stopActiveTimer } from '../utils/storage';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Get active timers from database (reactive)
  const activeTimers = useLiveQuery(() => getAllActiveTimers(), []);
  
  // Update current time every second (this will work even when tab is inactive)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed time for a timer (timestamp-based, always accurate)
  const getElapsedTime = useCallback((startTime) => {
    const start = new Date(startTime).getTime();
    const now = currentTime;
    return Math.floor((now - start) / 1000); // seconds
  }, [currentTime]);

  // Start a new timer
  const startTimer = useCallback(async (type, projectId, description, contentType) => {
    try {
      const startTime = new Date().toISOString();
      const timerId = await saveActiveTimer({
        type,
        projectId,
        description,
        contentType,
        startTime,
        status: 'active'
      });
      
      toast.success(`Started ${type} timer`);
      return timerId;
    } catch (error) {
      toast.error('Failed to start timer');
      throw error;
    }
  }, []);

  // Stop a timer
  const stopTimer = useCallback(async (timerId) => {
    try {
      const result = await stopActiveTimer(timerId);
      toast.success(`Timer stopped! Duration: ${Math.floor(result.duration / 60)}h ${result.duration % 60}m`);
      return result;
    } catch (error) {
      toast.error('Failed to stop timer');
      throw error;
    }
  }, []);

  // Pause a timer (update status but keep in activeTimers)
  const pauseTimer = useCallback(async (timerId) => {
    try {
      await updateActiveTimer(timerId, { status: 'paused' });
      toast.success('Timer paused');
    } catch (error) {
      toast.error('Failed to pause timer');
      throw error;
    }
  }, []);

  // Resume a timer
  const resumeTimer = useCallback(async (timerId) => {
    try {
      await updateActiveTimer(timerId, { status: 'active' });
      toast.success('Timer resumed');
    } catch (error) {
      toast.error('Failed to resume timer');
      throw error;
    }
  }, []);

  // Get formatted elapsed time for display
  const getFormattedElapsedTime = useCallback((startTime) => {
    const totalSeconds = getElapsedTime(startTime);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [getElapsedTime]);

  const value = {
    activeTimers: activeTimers || [],
    currentTime,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    getElapsedTime,
    getFormattedElapsedTime
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};