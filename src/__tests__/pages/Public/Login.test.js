// src/__tests__/components/Login.test.js
// Mock the modules first
jest.mock('react-router-dom', () => {
  const actualModule = jest.requireActual('react-router-dom');
  return {
    ...actualModule,
    useNavigate: () => mockedUsedNavigate
  };
});

jest.mock('../../../services/authService', () => ({
  authService: {
    login: jest.fn().mockImplementation((email, password) => {
      return Promise.resolve({
        token: 'fake-token',
        user: { id: 1, email: email }
      });
    }),
    verifyRegistration: jest.fn(),
    forgotPassword: jest.fn()
  }
}));

jest.mock('../../../services/apiService', () => ({
  apiService: {
    getProfile: jest.fn(),
    getBoardMemberRoles: jest.fn()
  }
}));

jest.mock('axios');

// Then import React and other dependencies
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import Login from '../../../pages/Public/Login';
import { authService } from '../../../services/authService';
import { apiService } from '../../../services/apiService';

// Mock navigate
const mockedUsedNavigate = jest.fn();

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Login Component Tests', () => {

  let localStorageMock;
  
  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Clear mocks
    jest.clearAllMocks();
  });

  const submitLoginForm = async (email, password) => {
    await userEvent.type(screen.getByLabelText('Email Address'), email);
    await userEvent.type(screen.getByLabelText('Password'), password);
    const form = screen.getByTestId('login-form');
    await fireEvent.submit(form);
  };


  // HOA-AUTH-UT-LOG-001: Email Validation
  test('HOA-AUTH-UT-LOG-001: Email Validation - validates email format correctly', async () => {
    render(<Login />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText('Email Address');
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      const errorMessage = screen.getByTestId('desktop-error-message');
      expect(errorMessage).toHaveTextContent('Invalid email format');
    });

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.queryByTestId('desktop-error-message')).not.toBeInTheDocument();
    });
  });

  // HOA-AUTH-IT-LOG-002: Board Member Login
  test('HOA-AUTH-IT-LOG-002: Board Member Login - handles board member login with permissions', async () => {
    authService.login.mockResolvedValueOnce({
      token: 'fake-token',
      user: {
        id: 1,
        email: 'board@example.com',
        role: 'board_member',
        boardMemberDetails: {
          ASSESS_FINES: '1',
          CHANGE_RATES: '1'
        }
      }
    });

    render(<Login />, { wrapper: TestWrapper });
    await submitLoginForm('board@example.com', 'ValidPassword123!');

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  // HOA-AUTH-IT-LOG-003: Temporary Password Flow
  test('HOA-AUTH-IT-LOG-003: Temporary Password Flow - handles temporary password login', async () => {
    authService.login.mockResolvedValueOnce({
      token: 'fake-token',
      user: { id: 1, email: 'test@example.com' },
      isTemporaryPassword: true
    });

    render(<Login />, { wrapper: TestWrapper });
    await submitLoginForm('test@example.com', 'TempPass123!');

    await waitFor(() => {
      expect(screen.getByText(/you must change your password/i)).toBeInTheDocument();
    });
  });

  // HOA-AUTH-RESP-LOG-001: Mobile Responsiveness
  test('HOA-AUTH-RESP-LOG-001: Mobile Responsiveness - renders mobile view correctly', async () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    render(<Login />, { wrapper: TestWrapper });

    expect(screen.getByTestId('mobile-login-tab')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-register-tab')).toBeInTheDocument();
  });

  // HOA-AUTH-RESP-LOG-002: View Toggle
  test('HOA-AUTH-RESP-LOG-002: View Toggle - toggles between login and registration views', async () => {
    render(<Login />, { wrapper: TestWrapper });

    const registerToggle = screen.getByTestId('register-toggle');
    fireEvent.click(registerToggle);

    await waitFor(() => {
      expect(screen.getByLabelText(/account number/i)).toBeInTheDocument();
    });

    const loginToggle = screen.getByTestId('login-toggle');
    fireEvent.click(loginToggle);

    await waitFor(() => {
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });
  });

  // HOA-AUTH-RESP-LOG-003: Error Handling
  test('HOA-AUTH-RESP-LOG-003: Error Handling - displays login errors appropriately', async () => {
    authService.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<Login />, { wrapper: TestWrapper });
    await submitLoginForm('test@example.com', 'WrongPass123!');

    await waitFor(() => {
      const errorMessage = screen.getByTestId('desktop-error-message');
      expect(errorMessage).toHaveTextContent(/check your username and password/i);
    });
  });
});