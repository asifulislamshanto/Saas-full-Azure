import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Subscription from './pages/Subscription';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <TenantProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                //<PrivateRoute>
                  <Dashboard />
                //</PrivateRoute>
              } />
              
              <Route path="/assets" element={
                //<PrivateRoute>
                  <Assets />
                //</PrivateRoute>
              } />
              
              <Route path="/subscription" element={
                //<PrivateRoute>
                  <Subscription />
                //</PrivateRoute>
              } />
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TenantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;