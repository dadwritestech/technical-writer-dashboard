// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// ===================================
// src/hooks/useTimeTracking.js
import { useState, useEffect, useCallback } from 'react';
import { saveTimeBlock } from '../utils/storage';
import toast from 'react-hot-toast';

export const useTimeTracking = () => {
  const [currentBlock, setCurrentBlock] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isActive && currentBlock) {
      interval = setInterval(() => {
        setElapsedTime((time) => time + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, currentBlock]);

  const startTimeBlock = useCallback((type, projectId, description) => {
    const newBlock = {
      type,
      projectId,
      description,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      status: 'active'
    };
    
    setCurrentBlock(newBlock);
    setElapsedTime(0);
    setIsActive(true);
    
    toast.success(`Started ${type} block`);
  }, []);

  const endTimeBlock = useCallback(async () => {
    if (!currentBlock) return;
    
    const endTime = new Date().toISOString();
    const completedBlock = {
      ...currentBlock,
      endTime,
      duration: Math.floor(elapsedTime / 60), // Convert to minutes
      status: 'completed'
    };
    
    try {
      await saveTimeBlock(completedBlock);
      toast.success('Time block saved!');
      
      setCurrentBlock(null);
      setElapsedTime(0);
      setIsActive(false);
    } catch (error) {
      toast.error('Failed to save time block');
    }
  }, [currentBlock, elapsedTime]);

  const pauseTimeBlock = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeTimeBlock = useCallback(() => {
    setIsActive(true);
  }, []);

  return {
    currentBlock,
    elapsedTime,
    isActive,
    startTimeBlock,
    endTimeBlock,
    pauseTimeBlock,
    resumeTimeBlock
  };
};