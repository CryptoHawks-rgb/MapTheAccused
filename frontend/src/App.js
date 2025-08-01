import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import AccusedDetail from './pages/AccusedDetail';
import ManageAccused from './pages/ManageAccused';
import ManageUsers from './pages/ManageUsers';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            <Route path="/accused/:id" element={
              <ProtectedRoute>
                <AccusedDetail />
              </ProtectedRoute>
            } />
            <Route path="/manage-accused" element={
              <ProtectedRoute requiredRole="admin">
                <ManageAccused />
              </ProtectedRoute>
            } />
            <Route path="/manage-users" element={
              <ProtectedRoute requiredRole="superadmin">
                <ManageUsers />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;