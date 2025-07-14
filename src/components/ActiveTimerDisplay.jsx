import React from 'react';
import { Clock, Pause, Play, Square } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { getContentTypeByValue, getWorkPhaseByValue } from '../utils/contentTypes';

const ActiveTimerDisplay = () => {
  const { activeTimers, getFormattedElapsedTime, pauseTimer, resumeTimer, stopTimer } = useTimer();

  if (!activeTimers || activeTimers.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {activeTimers.map((timer) => {
        const contentType = getContentTypeByValue(timer.contentType);
        const workPhase = getWorkPhaseByValue(timer.type);
        const isActive = timer.status === 'active';
        
        return (
          <div
            key={timer.id}
            className={`bg-white dark:bg-dark-800 rounded-lg shadow-lg border-l-4 p-3 min-w-64 ${
              isActive ? 'border-green-500 animate-pulse-soft' : 'border-yellow-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-yellow-600'}`} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {isActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <div className="flex space-x-1">
                {isActive ? (
                  <button
                    onClick={() => pauseTimer(timer.id)}
                    className="p-1 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"
                    title="Pause timer"
                  >
                    <Pause className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => resumeTimer(timer.id)}
                    className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                    title="Resume timer"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => stopTimer(timer.id)}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Stop timer"
                >
                  <Square className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="text-sm">
              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {timer.description || `${workPhase.label} - ${contentType.label}`}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                {contentType.icon} {contentType.label}
              </div>
            </div>
            
            <div className="mt-2 text-lg font-mono font-bold text-center">
              {getFormattedElapsedTime(timer.startTime)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveTimerDisplay;