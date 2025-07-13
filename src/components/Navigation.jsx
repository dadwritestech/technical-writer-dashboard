import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  FolderOpen, 
  FileText, 
  Settings,
  Download,
  Moon,
  Sun,
  Sparkles
} from 'lucide-react';
import { exportData } from '../utils/exportImport';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Navigation = () => {
  const { isDark, toggleTheme } = useTheme();
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/time', icon: Clock, label: 'Time Tracking' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/weekly', icon: FileText, label: 'Weekly Summary' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="backdrop-blur-md bg-white/80 dark:bg-dark-900/80 border-b border-white/20 dark:border-dark-700/50 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  TechWriter
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                  DASHBOARD
                </p>
              </div>
            </div>
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link flex items-center space-x-2 text-sm font-medium ${isActive ? 'active' : ''}`
                  }
                  aria-label={`Navigate to ${item.label}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="relative p-3 rounded-xl bg-white/50 dark:bg-dark-700/50 backdrop-blur-sm border border-white/30 dark:border-dark-600/30 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="relative w-5 h-5">
                <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                  isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`} />
                <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                  isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`} />
              </div>
            </button>
            
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-3 bg-white/50 dark:bg-dark-700/50 backdrop-blur-sm border border-white/30 dark:border-dark-600/30 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              aria-label="Export data backup"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Backup</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;