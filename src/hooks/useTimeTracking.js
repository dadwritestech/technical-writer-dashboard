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

  const startTimeBlock = useCallback((type, projectId, description, contentType) => {
    const newBlock = {
      type,
      projectId,
      description,
      contentType,
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