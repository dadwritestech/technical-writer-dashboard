import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TimeTracker from './components/TimeTracker';
import ProjectManager from './components/ProjectManager';
import WeeklySummary from './components/WeeklySummary';
import Settings from './components/Settings';

function App() {
  return (
    <ThemeProvider>
      <Router basename="/technical-writer-dashboard">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-900 dark:via-dark-800 dark:to-indigo-950 transition-all duration-500">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/time" element={<TimeTracker />} />
              <Route path="/projects" element={<ProjectManager />} />
              <Route path="/weekly" element={<WeeklySummary />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-dark-800 dark:text-white',
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              }
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;