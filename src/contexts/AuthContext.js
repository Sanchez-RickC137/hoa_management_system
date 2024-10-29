import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicRoute = (path) => {
    return [
      '/',
      '/about',
      '/amenities',
      '/contact',
      '/privacy-policy',
      '/terms'
    ].includes(path);
  };

  const initializeAuth = useCallback(async () => {
    console.log('Initializing auth...');
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found');
      setLoading(false);
      // Only navigate to login if trying to access a protected route
      if (!isPublicRoute(location.pathname) && 
          !location.pathname.match(/^\/(login|register|forgot-password|reset-password)/)) {
        navigate('/login');
      }
      return;
    }
  
    try {
      const response = await apiService.getProfile();
      
      if (response) {
        const userData = {
          id: response.OWNER_ID,
          email: response.EMAIL,
          firstName: response.FIRST_NAME,
          lastName: response.LAST_NAME,
          role: response.role || 'resident',
          boardMemberDetails: response.boardMemberDetails || null
        };
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      if (error.response?.status === 401) {
        try {
          const newToken = await authService.refreshToken();
          if (newToken) {
            return initializeAuth();
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('token');
          setUser(null);
          if (!isPublicRoute(location.pathname) && 
              !location.pathname.match(/^\/(login|register|forgot-password|reset-password)/)) {
            navigate('/login');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const hasBoardPermission = useCallback((permission) => {
    console.log('Checking board permission:', permission);
    console.log('Current user:', user);
    console.log('Board member details:', user?.boardMemberDetails);
  
    if (!user?.boardMemberDetails) {
      console.log('No board member details found');
      return false;
    }
  
    // Check specific permissions from boardMemberDetails
    const permValue = user.boardMemberDetails[permission];
    console.log(`Permission ${permission} value:`, permValue);
  
    switch (permission) {
      case 'ASSESS_FINES':
        return user.boardMemberDetails.ASSESS_FINES == '1';
      case 'CHANGE_RATES':
        return user.boardMemberDetails.CHANGE_RATES == '1';
      case 'CHANGE_MEMBERS':
        return user.boardMemberDetails.CHANGE_MEMBERS == '1';
      default:
        console.log('Unknown permission requested:', permission);
        return false;
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response && response.token) {
        const userData = {
          ...response.user,
          role: response.user.role,
          boardMemberDetails: response.user.boardMemberDetails
        };
        
        setUser(userData);
        return {
          success: true,
          user: userData,
          isTemporaryPassword: response.isTemporaryPassword
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'An error occurred during login');
      return {
        success: false,
        error: error.response?.data?.error || 'An error occurred during login'
      };
    }
  };

  const logout = useCallback(() => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    navigate('/login');
  }, [navigate]);

  const updateUserRole = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiService.getBoardMemberRoles();
      const boardMemberResult = response.find(role => role.OWNER_ID === user.id);

      setUser(prev => ({
        ...prev,
        role: boardMemberResult ? 'board_member' : 'resident',
        boardMemberDetails: boardMemberResult || null
      }));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  }, [user]);

  const isBoardMember = useCallback(() => {
    if (!user?.boardMemberDetails) return false;
    
    if (user.boardMemberDetails.END_DATE) {
      const endDate = new Date(user.boardMemberDetails.END_DATE);
      const currentDate = new Date();
      if (currentDate >= endDate) return false;
    }
    
    return user.role === 'board_member';
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      logout,
      isBoardMember,
      hasBoardPermission,
      updateUserRole
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;