// Map between technical writing work phases and traditional time tracking categories
export const mapWorkPhaseToTimeCategory = (workPhase) => {
  const mapping = {
    'research': 'deepWork',
    'writing': 'deepWork', 
    'review-editing': 'deepWork',
    'version-updates': 'shallowWork',
    'publishing': 'shallowWork',
    'maintenance': 'shallowWork',
    'meeting': 'meetings',
    'planning': 'planning'
  };
  
  return mapping[workPhase] || 'other';
};

export const getTimeCategoryLabel = (category) => {
  const labels = {
    'deepWork': 'Deep Work',
    'shallowWork': 'Shallow Work', 
    'meetings': 'Meetings',
    'planning': 'Planning',
    'other': 'Other'
  };
  
  return labels[category] || 'Other';
};

export const getTimeCategoryColor = (category) => {
  const colors = {
    'deepWork': 'purple',
    'shallowWork': 'blue', 
    'meetings': 'green',
    'planning': 'yellow',
    'other': 'gray'
  };
  
  return colors[category] || 'gray';
};