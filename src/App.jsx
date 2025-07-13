import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import MobileNavigation from './components/MobileNavigation';
import Dashboard from './components/Dashboard';
import TimeTracker from './components/TimeTracker';
import ProjectManager from './components/ProjectManager';
import WeeklySummary from './components/WeeklySummary';
import Settings from './components/Settings';

function App() {
  return (
    <ErrorBoundary fallbackMessage="The Technical Writer Dashboard encountered an error. Please try refreshing the page.">
      <ThemeProvider>
        <Router basename="/technical-writer-dashboard/">
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-900 dark:via-dark-800 dark:to-indigo-950 transition-all duration-500">
            <ErrorBoundary fallbackMessage="Navigation component failed to load.">
              <Navigation />
            </ErrorBoundary>
            <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary fallbackMessage="Dashboard component failed to load.">
                    <Dashboard />
                  </ErrorBoundary>
                } />
                <Route path="/time" element={
                  <ErrorBoundary fallbackMessage="Time Tracker component failed to load.">
                    <TimeTracker />
                  </ErrorBoundary>
                } />
                <Route path="/projects" element={
                  <ErrorBoundary fallbackMessage="Project Manager component failed to load.">
                    <ProjectManager />
                  </ErrorBoundary>
                } />
                <Route path="/weekly" element={
                  <ErrorBoundary fallbackMessage="Weekly Summary component failed to load.">
                    <WeeklySummary />
                  </ErrorBoundary>
                } />
                <Route path="/settings" element={
                  <ErrorBoundary fallbackMessage="Settings component failed to load.">
                    <Settings />
                  </ErrorBoundary>
                } />
              </Routes>
            </main>
            <ErrorBoundary fallbackMessage="Mobile navigation failed to load.">
              <MobileNavigation />
            </ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;