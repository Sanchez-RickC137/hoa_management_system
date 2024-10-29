import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BoardMemberRoute = ({ children }) => {
  const { user, isBoardMember } = useAuth();
  
  if (!user || !isBoardMember()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default BoardMemberRoute;