import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../utils/storage';

const DebugPanel = () => {
  const timeBlocks = useLiveQuery(() => db.timeBlocks.toArray(), []);
  const projects = useLiveQuery(() => db.projects.toArray(), []);

  if (!timeBlocks || !projects) return <div>Loading debug info...</div>;

  return (
    <div className="card mt-8 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
      <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-300">Debug Information</h3>
      
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-semibold">Projects ({projects.length}):</h4>
          <pre className="bg-white dark:bg-dark-800 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(projects.map(p => ({ id: p.id, name: p.name, team: p.team })), null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-semibold">Recent Time Blocks ({timeBlocks.length}):</h4>
          <pre className="bg-white dark:bg-dark-800 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(timeBlocks.slice(-5).map(b => ({ 
              id: b.id, 
              projectId: b.projectId, 
              projectName: b.projectName,
              projectTeam: b.projectTeam,
              type: b.type, 
              duration: b.duration,
              startTime: b.startTime ? new Date(b.startTime).toLocaleString() : null
            })), null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold">Data Consistency Check:</h4>
          <ul className="text-xs space-y-1">
            <li>Time blocks with project names: {timeBlocks.filter(b => b.projectName).length}</li>
            <li>Time blocks without project names: {timeBlocks.filter(b => b.projectId && !b.projectName).length}</li>
            <li>Time blocks with "Unknown Project": {timeBlocks.filter(b => b.projectName === 'Unknown Project').length}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;