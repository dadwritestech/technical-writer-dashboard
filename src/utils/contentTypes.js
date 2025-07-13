// Technical Writing Content Types and Work Phases

export const contentTypes = [
  { value: 'api-docs', label: 'API Documentation', icon: '🔌', color: 'blue' },
  { value: 'user-guides', label: 'User Guides', icon: '📖', color: 'green' },
  { value: 'release-notes', label: 'Release Notes', icon: '📋', color: 'purple' },
  { value: 'tutorials', label: 'Tutorials', icon: '🎓', color: 'yellow' },
  { value: 'technical-specs', label: 'Technical Specifications', icon: '⚙️', color: 'gray' },
  { value: 'reference', label: 'Reference Documentation', icon: '📚', color: 'indigo' },
  { value: 'troubleshooting', label: 'Troubleshooting Guides', icon: '🔧', color: 'red' },
  { value: 'onboarding', label: 'Onboarding Materials', icon: '🚀', color: 'teal' },
  { value: 'other', label: 'Other Documentation', icon: '📄', color: 'gray' }
];

export const workPhases = [
  { value: 'research', label: 'Research & Discovery', icon: '🔍', color: 'blue' },
  { value: 'writing', label: 'Writing & Creation', icon: '✍️', color: 'green' },
  { value: 'review-editing', label: 'Review & Editing', icon: '📝', color: 'yellow' },
  { value: 'version-updates', label: 'Version Updates', icon: '🔄', color: 'purple' },
  { value: 'publishing', label: 'Publishing & Distribution', icon: '📤', color: 'indigo' },
  { value: 'maintenance', label: 'Maintenance & Updates', icon: '🛠️', color: 'orange' }
];

export const documentVersions = [
  { value: 'draft-1', label: 'Draft v1 (Initial)', color: 'gray' },
  { value: 'draft-2', label: 'Draft v2 (Technical Review)', color: 'blue' },
  { value: 'draft-3', label: 'Draft v3 (Stakeholder Review)', color: 'yellow' },
  { value: 'draft-final', label: 'Draft (Final Edits)', color: 'orange' },
  { value: 'published-1-0', label: 'Published v1.0', color: 'green' },
  { value: 'update-minor', label: 'Update in Progress (Minor)', color: 'purple' },
  { value: 'update-major', label: 'Major Revision in Progress', color: 'red' },
  { value: 'deprecated', label: 'Deprecated', color: 'gray' }
];

export const maintenanceStatus = [
  { value: 'current', label: 'Current (< 3 months)', color: 'green', daysThreshold: 90 },
  { value: 'stale', label: 'Stale (3-6 months)', color: 'yellow', daysThreshold: 180 },
  { value: 'outdated', label: 'Outdated (6+ months)', color: 'orange', daysThreshold: 365 },
  { value: 'critical', label: 'Critical - Needs Urgent Update', color: 'red', daysThreshold: null },
  { value: 'deprecated', label: 'Deprecated', color: 'gray', daysThreshold: null }
];

export const getContentTypeByValue = (value) => {
  return contentTypes.find(type => type.value === value) || contentTypes[contentTypes.length - 1];
};

export const getWorkPhaseByValue = (value) => {
  return workPhases.find(phase => phase.value === value) || workPhases[0];
};

export const getVersionByValue = (value) => {
  return documentVersions.find(version => version.value === value) || documentVersions[0];
};

export const getMaintenanceStatusByValue = (value) => {
  return maintenanceStatus.find(status => status.value === value) || maintenanceStatus[0];
};

export const calculateMaintenanceStatus = (lastUpdated) => {
  if (!lastUpdated) return 'critical';
  
  const daysSinceUpdate = Math.floor((new Date() - new Date(lastUpdated)) / (1000 * 60 * 60 * 24));
  
  if (daysSinceUpdate <= 90) return 'current';
  if (daysSinceUpdate <= 180) return 'stale';
  if (daysSinceUpdate <= 365) return 'outdated';
  return 'critical';
};