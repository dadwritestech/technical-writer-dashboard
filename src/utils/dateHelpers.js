import { format, startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatTime = (date) => {
  return format(new Date(date), 'h:mm a');
};

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const getWeekRange = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

export const calculateDuration = (startTime, endTime) => {
  return differenceInMinutes(new Date(endTime), new Date(startTime));
};

export const getTimeBlockType = (type) => {
  const types = {
    'deep-work': { label: 'Deep Work', color: 'bg-purple-500' },
    'shallow-work': { label: 'Shallow Work', color: 'bg-blue-500' },
    'meeting': { label: 'Meeting', color: 'bg-green-500' },
    'planning': { label: 'Planning', color: 'bg-yellow-500' },
    'break': { label: 'Break', color: 'bg-gray-400' }
  };
  return types[type] || { label: type, color: 'bg-gray-500' };
};