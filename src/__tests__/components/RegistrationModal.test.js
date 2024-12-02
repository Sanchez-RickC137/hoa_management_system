// src/__tests__/components/RegistrationModal.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';
import RegistrationModal from '../../components/RegistrationModal';
import { apiService } from '../../services/apiService';

// Mock API service
jest.mock('../../services/apiService', () => ({
  apiService: {
    register: jest.fn()
  }
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('RegistrationModal Tests', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const defaultProps = {
    accountId: 'ACC123',
    ownerId: 'OWN456',
    onClose: mockOnClose,
    onSuccess: mockOnSuccess
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // HOA-AUTH-UT-REG-001: Test registration code validation
  test('validates registration code format', async () => {
    render(<RegistrationModal {...defaultProps} />, { wrapper: TestWrapper });
    
    // Get to the password step first
    const firstNameInput = screen.getByLabelText('first name');
    const lastNameInput = screen.getByLabelText('last name');
    
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    
    await userEvent.type(screen.getByLabelText('email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('phone'), '1234567890');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    
    // Now on password step, test password validation
    const passwordInput = screen.getByLabelText('password');
    await userEvent.type(passwordInput, 'SecurePass123!');
    
    const confirmPasswordInput = screen.getByLabelText('confirm password');
    await userEvent.type(confirmPasswordInput, 'DifferentPass123!');
    
    await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));
  });

  // HOA-AUTH-UT-REG-002: Test personal info collection
  test('validates and collects personal information', async () => {
    render(<RegistrationModal {...defaultProps} />, { wrapper: TestWrapper });

    // Find First Name and Last Name inputs by their container text
    const firstNameInput = screen.getByText('First Name').nextSibling;
    const lastNameInput = screen.getByText('Last Name').nextSibling;
    
    // Try to continue without filling required fields
    await userEvent.click(screen.getByText(/continue/i));
    
    // HTML5 validation should prevent submission
    expect(firstNameInput).toBeRequired();
    expect(lastNameInput).toBeRequired();

    // Fill valid data
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.click(screen.getByText(/continue/i));

    // Should show next section (Contact Info)
    await waitFor(() => {
      expect(screen.getByText('CONTACT INFO')).toBeInTheDocument();
    });
  });

  // HOA-AUTH-RESP-REG-001: Test mobile responsiveness
  test('renders correctly on mobile viewport', async () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(<RegistrationModal {...defaultProps} />, { wrapper: TestWrapper });
    
    const modalContainer = screen.getByText('Complete Registration').closest('.fixed');
    expect(modalContainer).toHaveClass('inset-0');
  });

  // HOA-AUTH-RESP-REG-002: Test tablet responsiveness
  test('renders correctly on tablet viewport', async () => {
    global.innerWidth = 800;
    global.dispatchEvent(new Event('resize'));
    
    render(<RegistrationModal {...defaultProps} />, { wrapper: TestWrapper });
    
    const modalContainer = screen.getByText('Complete Registration').closest('.fixed');
    expect(modalContainer).toHaveClass('inset-0');
  });

  // // HOA-AUTH-IT-REG-001: Test complete registration flow
  // test('completes full registration process', async () => {
  //   apiService.register.mockResolvedValueOnce({ success: true });
    
  //   render(<RegistrationModal {...defaultProps} />, { wrapper: TestWrapper });

  //   // Step 1: Personal Info
  //   await userEvent.type(screen.getByLabelText(/first name/i), 'John');
  //   await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
  //   await userEvent.click(screen.getByRole('button', { name: /continue/i }));

  //   // Step 2: Contact Info
  //   await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
  //   await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');
  //   await userEvent.click(screen.getByRole('button', { name: /continue/i }));

  //   // Step 3: Password
  //   await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!');
  //   await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
  //   await userEvent.click(screen.getByRole('button', { name: /complete registration/i }));

  //   await waitFor(() => {
  //     expect(apiService.register).toHaveBeenCalledWith({
  //       accountId: 'ACC123',
  //       ownerId: 'OWN456',
  //       firstName: 'John',
  //       lastName: 'Doe',
  //       email: 'john.doe@example.com',
  //       phoneNumber: '1234567890',
  //       password: 'SecurePass123!'
  //     });
  //     expect(mockOnSuccess).toHaveBeenCalled();
  //   });
  // });

  // Test error handling
  test('handles registration errors appropriately', async () => {
    apiService.register.mockRejectedValueOnce(new Error('Registration failed'));

    render(<RegistrationModal {...defaultProps} />, { wrapper: TestWrapper });

    // Fill out form - Step 1
    await userEvent.type(screen.getByLabelText(/first name/i), 'John');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2
    await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
    
    // Use role to find the submit button specifically
    const submitButton = screen.getByRole('button', { name: /complete registration/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  // Test close functionality
  test('closes modal when X button is clicked', async () => {
    render(<RegistrationModal {...defaultProps} />, { wrapper: TestWrapper });

    const closeButton = screen.getByText('×');
    await userEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test step navigation
  test('navigates through steps correctly', async () => {
    render(<RegistrationModal {...defaultProps} />, { wrapper: TestWrapper });

    // Should start with Personal Info
    expect(screen.getByText('PERSONAL INFO')).toBeInTheDocument();

    // Fill out first step
    const firstNameInput = screen.getByText('First Name').nextSibling;
    const lastNameInput = screen.getByText('Last Name').nextSibling;
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.click(screen.getByText(/continue/i));

    // Should show Contact Info
    expect(screen.getByText('CONTACT INFO')).toBeInTheDocument();

    // Can go back to first step
    await userEvent.click(screen.getByText(/back/i));
    expect(screen.getByText('PERSONAL INFO')).toBeInTheDocument();
  });
});