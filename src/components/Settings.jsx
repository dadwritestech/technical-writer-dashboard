import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  Save,
  AlertTriangle,
  CheckCircle,
  Database,
  Shield
} from 'lucide-react';
import { exportData, importData } from '../utils/exportImport';
import { db } from '../utils/storage';
import toast from 'react-hot-toast';

const Settings = () => {
  const [lastBackupDate, setLastBackupDate] = useState(
    localStorage.getItem('lastBackupDate')
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    await exportData();
    setLastBackupDate(new Date().toISOString());
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await importData(file);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAllData = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      await db.timeBlocks.clear();
      await db.projects.clear();
      await db.weeklySummaries.clear();
      await db.preferences.clear();
      
      localStorage.removeItem('lastBackupDate');
      setLastBackupDate(null);
      
      toast.success('All data cleared successfully');
      setIsDeleting(false);
      
      // Reload the page to refresh the UI
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to clear data: ' + error.message);
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  const formatBackupDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Data Management */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold">Data Management</h3>
        </div>

        <div className="space-y-4">
          {/* Last Backup Info */}
          <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Last Backup</p>
            <p className="font-medium dark:text-gray-200">{formatBackupDate(lastBackupDate)}</p>
          </div>

          {/* Export Data */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-gray-600">
                Download a backup of all your data as a JSON file
              </p>
            </div>
            <button
              onClick={handleExport}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          {/* Import Data */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium">Import Data</h4>
              <p className="text-sm text-gray-600">
                Restore data from a backup file (this will replace all existing data)
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Storage Information */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold">Privacy & Storage</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Local Storage Only</p>
              <p className="text-sm text-gray-600">
                All your data is stored locally in your browser using IndexedDB. 
                No data is sent to external servers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">No Analytics or Tracking</p>
              <p className="text-sm text-gray-600">
                This application doesn't use any analytics, tracking, or third-party services.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Offline Capable</p>
              <p className="text-sm text-gray-600">
                The application works completely offline after the initial load.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Clear All Data</h4>
            <p className="text-sm text-red-700 mb-4">
              This will permanently delete all your time blocks, projects, and settings. 
              This action cannot be undone. Make sure to export your data first!
            </p>

            {!isDeleting ? (
              <button
                onClick={handleClearAllData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-red-800">
                  Are you absolutely sure? This will delete everything!
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleClearAllData}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Built with:</strong> React, Vite, Tailwind CSS, Dexie.js</p>
          <p><strong>License:</strong> MIT</p>
          <p>
            A productivity dashboard designed for technical writers to track time, 
            manage projects, and generate weekly reports.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;