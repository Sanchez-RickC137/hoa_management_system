// src/__tests__/integration/auth.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from '../../pages/Public/Login';
import { authService } from '../../services/authService';
import { apiService } from '../../services/apiService';

// Mock our services
jest.mock('../../services/authService', () => ({
  authService: {
    login: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn()
  }
}));

jest.mock('../../services/apiService', () => ({
  apiService: {
    getProfile: jest.fn(),
    getBoardMemberRoles: jest.fn()
  }
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderLogin = () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('handles invalid login', async () => {
    // Mock failed login
    authService.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@email.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/check your username and password/i)).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    };

    // Mock successful login
    authService.login.mockResolvedValueOnce({
      token: 'fake-token',
      user: mockUser,
      isTemporaryPassword: false
    });

    apiService.getProfile.mockResolvedValueOnce({
      OWNER_ID: 1,
      EMAIL: 'test@example.com',
      FIRST_NAME: 'Test',
      LAST_NAME: 'User'
    });

    renderLogin();

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify token was stored
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
    });
  });

  test('handles temporary password login', async () => {
    // Mock temporary password login
    authService.login.mockResolvedValueOnce({
      token: 'temp-token',
      user: {
        id: 1,
        email: 'test@example.com'
      },
      isTemporaryPassword: true
    });

    renderLogin();

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'temppass123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check for password change modal
    await waitFor(() => {
      expect(screen.getByText(/you must change your password/i)).toBeInTheDocument();
    });

    // Fill password change form
    await userEvent.type(screen.getByLabelText(/new password/i), 'NewSecurePass123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'NewSecurePass123!');
    await userEvent.click(screen.getByRole('button', { name: /change password/i }));
  });

  test('handles password reset request', async () => {
    // Mock successful password reset request
    authService.forgotPassword.mockResolvedValueOnce({ success: true });

    renderLogin();

    // Click forgot password and fill form
    await userEvent.click(screen.getByText(/forgot password/i));
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/password reset instructions/i)).toBeInTheDocument();
    });
  });

  test('handles registration verification', async () => {
    renderLogin();

    // Navigate to registration
    await userEvent.click(screen.getByRole('button', { name: /need to register/i }));

    // Fill registration form
    await userEvent.type(screen.getByLabelText(/account number/i), 'ACC123');
    await userEvent.type(screen.getByLabelText(/owner id/i), 'OWN456');
    await userEvent.type(screen.getByLabelText(/temporary code/i), 'TEMP789');
    await userEvent.click(screen.getByRole('button', { name: /verify registration/i }));

    // Check for registration modal
    await waitFor(() => {
      expect(screen.getByText(/complete registration/i)).toBeInTheDocument();
    });
  });
});