// src/__tests__/components/ProtectedRoute.test.js
import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

const mockUser = { id: 1, email: 'test@example.com' };

// Test components
const TestPage = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

describe('ProtectedRoute', () => {
  const renderWithProviders = async (initialUser = null) => {
    let setContextUser;
    
    const TestAuthProvider = ({ children }) => {
      const [user, setUser] = React.useState(initialUser);
      setContextUser = setUser;
      
      return (
        <AuthProvider overrideValue={{ user, setUser }}>
          {children}
        </AuthProvider>
      );
    };

    await act(async () => {
      render(
        <BrowserRouter>
          <TestAuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TestPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </TestAuthProvider>
        </BrowserRouter>
      );
    });

    return { setContextUser };
  };

  test('redirects to login when no user is authenticated', async () => {
    await renderWithProviders();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders protected content when user is authenticated', async () => {
    await renderWithProviders(mockUser);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  test('handles navigation after login', async () => {
    const { setContextUser } = await renderWithProviders();
    
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    
    await act(async () => {
      setContextUser(mockUser);
    });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});