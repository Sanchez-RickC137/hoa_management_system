// src/__tests__/contexts/AuthContext.test.js
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock axios first
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }))
}));

// Then mock our services
jest.mock('../../services/apiService', () => ({
  apiService: {
    getProfile: jest.fn(),
    getBoardMemberRoles: jest.fn()
  }
}));

jest.mock('../../services/authService', () => ({
  authService: {
    login: jest.fn(),
    refreshToken: jest.fn()
  }
}));

// Import services after mocking
import { apiService } from '../../services/apiService';
import { authService } from '../../services/authService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: key => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Test component
const TestComponent = ({ onMount }) => {
  const auth = useAuth();
  React.useEffect(() => {
    if (onMount) onMount(auth);
  }, [onMount]);
  return null;
};

describe('AuthContext', () => {
  let contextValue;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderAuthProvider = async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent onMount={(auth) => {
            contextValue = auth;
          }} />
        </AuthProvider>
      </BrowserRouter>
    );
    // Wait for initial render
    await act(() => Promise.resolve());
  };

  test('initializes with null user and handles login', async () => {
    const mockToken = 'fake-token';
    const mockUser = {
      id: 1,
      email: 'test@example.com'
    };

    authService.login.mockResolvedValueOnce({
      token: mockToken,
      user: mockUser,
      isTemporaryPassword: false
    });

    await renderAuthProvider();
    
    expect(contextValue.user).toBeNull();

    await act(async () => {
      const result = await contextValue.login('test@example.com', 'password');
      expect(result.success).toBe(true);
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(contextValue.user).toEqual(mockUser);
  });

  test('handles logout', async () => {
    localStorage.setItem('token', 'test-token');
    
    apiService.getProfile.mockResolvedValueOnce({
      OWNER_ID: 1,
      EMAIL: 'test@example.com'
    });

    await renderAuthProvider();
    
    await act(async () => {
      await contextValue.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(contextValue.user).toBeNull();
  });

  test('loads user profile on initialization if token exists', async () => {
    localStorage.setItem('token', 'test-token');
    
    const mockProfile = {
      OWNER_ID: 1,
      EMAIL: 'test@example.com',
      FIRST_NAME: 'Test',
      LAST_NAME: 'User'
    };

    apiService.getProfile.mockResolvedValueOnce(mockProfile);

    await renderAuthProvider();

    await waitFor(() => {
      expect(contextValue.user).toBeTruthy();
      expect(contextValue.user.email).toBe('test@example.com');
    });
  });

  test('handles board member roles', async () => {
    localStorage.setItem('token', 'test-token');
    
    const mockProfile = {
      OWNER_ID: 1,
      EMAIL: 'test@example.com',
      role: 'board_member',
      boardMemberDetails: {
        MEMBER_ID: 1,
        ASSESS_FINES: '1',
        CHANGE_RATES: '1'
      }
    };

    apiService.getProfile.mockResolvedValueOnce(mockProfile);

    await renderAuthProvider();

    await waitFor(() => {
      expect(contextValue.user).toBeTruthy();
      expect(contextValue.user.role).toBe('board_member');
      expect(contextValue.hasBoardPermission('ASSESS_FINES')).toBe(true);
    });
  });
});