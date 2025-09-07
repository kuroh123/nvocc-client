import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
                <Route path="dashboard" element={<ProtectedRoute requirePermission="dashboard.view"><Dashboard /></ProtectedRoute>} />
              
              <Route path="bookings" element={<Bookings />} />
              <Route path="customers" element={<Customers />} />
              
              {/* Placeholder routes for other pages */}
              <Route path="ports" element={
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900">Ports Management</h1>
                  <p className="text-gray-600 mt-2">This page is under development.</p>
                </div>
              } />
              
              <Route path="depots" element={
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900">Depots Management</h1>
                  <p className="text-gray-600 mt-2">This page is under development.</p>
                </div>
              } />
              
              <Route path="users" element={
                <ProtectedRoute requirePermission="users:read">
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-2">This page is under development.</p>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="roles" element={
                <ProtectedRoute requirePermission="roles:read">
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                    <p className="text-gray-600 mt-2">This page is under development.</p>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="activity-logs" element={
                <ProtectedRoute requirePermission="logs:read">
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-600 mt-2">This page is under development.</p>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                  <p className="text-gray-600 mt-2">This page is under development.</p>
                </div>
              } />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="text-gray-600 mt-2">Page not found</p>
                  <a href="/dashboard" className="mt-4 inline-block btn btn-primary">
                    Go to Dashboard
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
