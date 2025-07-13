import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  FolderOpen, 
  FileText, 
  Settings,
  Download
} from 'lucide-react';
import { exportData } from '../utils/exportImport';

const Navigation = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/time', icon: Clock, label: 'Time Tracking' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/weekly', icon: FileText, label: 'Weekly Summary' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-primary-600">
              TechWriter Dashboard
            </h1>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Backup</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;