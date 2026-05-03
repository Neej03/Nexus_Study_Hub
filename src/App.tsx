/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';

// Placeholder for pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const Planner = React.lazy(() => import('./pages/Planner'));
const Pomodoro = React.lazy(() => import('./pages/Pomodoro'));
const Notes = React.lazy(() => import('./pages/Notes'));
const Progress = React.lazy(() => import('./pages/Progress'));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="planner" element={<Planner />} />
              <Route path="pomodoro" element={<Pomodoro />} />
              <Route path="notes" element={<Notes />} />
              <Route path="progress" element={<Progress />} />
            </Route>
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}
