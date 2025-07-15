import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  FolderOpen, 
  Users,
  FileText, 
  Settings
} from 'lucide-react';

const MobileNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/time', icon: Clock, label: 'Time' },
    { to: '/projects', icon: FolderOpen, label: 'Projects' },
    { to: '/teams', icon: Users, label: 'Teams' },
    { to: '/weekly', icon: FileText, label: 'Weekly' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              aria-label={`Navigate to ${item.label}`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;