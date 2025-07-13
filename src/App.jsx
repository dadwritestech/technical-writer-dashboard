import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TimeTracker from './components/TimeTracker';
import ProjectManager from './components/ProjectManager';
import WeeklySummary from './components/WeeklySummary';
import Settings from './components/Settings';

function App() {
  return (
    <Router basename="/technical-writer-dashboard">
      <div className="min-h-screen bg-gray-50">
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
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;