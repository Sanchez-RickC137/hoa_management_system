// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Amenities from './pages/Amenities';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Payments from './pages/Payments';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Account from './pages/Account';
import OwnerInfo from './pages/OwnerInfo';
import Survey from './pages/Survey';
import AnnouncementsNews from './pages/AnnouncementsNews';
import BoardMemberDashboard from './pages/BoardMemberDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/amenities" element={<Amenities />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><Layout><Documents /></Layout></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><Layout><Payments /></Layout></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><Layout><Account /></Layout></ProtectedRoute>} />
                <Route path="/owner-info" element={<ProtectedRoute><Layout><OwnerInfo /></Layout></ProtectedRoute>} />
                <Route path="/surveys" element={<ProtectedRoute><Layout><Survey /></Layout></ProtectedRoute>} />
                <Route path="/news-events" element={<ProtectedRoute><Layout><AnnouncementsNews /></Layout></ProtectedRoute>} />
                <Route path="/board-dashboard" element={<ProtectedRoute><Layout><BoardMemberDashboard /></Layout></ProtectedRoute>} />
              </Routes>
            </Layout>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;