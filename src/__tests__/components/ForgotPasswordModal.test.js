// src/__tests__/components/ForgotPasswordModal.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../contexts/ThemeContext';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';
import { authService } from '../../services/authService';

jest.mock('../../services/authService', () => ({
  authService: {
    forgotPassword: jest.fn()
  }
}));

const TestWrapper = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

describe('ForgotPasswordModal Tests', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // HOA-AUTH-UT-PASS-001: Test email validation
  test('validates email format before submission', async () => {
    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    const emailInput = screen.getByPlaceholderText(/enter your email address/i);
    const form = screen.getByTestId('forgot-password-form');

    // Test invalid email
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.submit(form);

    // The validation is handled by the HTML5 email input
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toBeInvalid();

    // Test valid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput).toBeValid();
  });

  // HOA-AUTH-IT-PASS-001: Test reset process flow
  test('handles password reset process', async () => {
    authService.forgotPassword.mockResolvedValueOnce({ success: true });

    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    await userEvent.type(screen.getByPlaceholderText(/enter your email address/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText(/password reset instructions have been sent to your email/i)).toBeInTheDocument();
    });
  });

  // HOA-AUTH-RESP-PASS-001: Test mobile responsiveness
  test('renders correctly on mobile viewport', async () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    // Check responsive container
    const modalContainer = screen.getByRole('heading', { name: /reset password/i }).closest('div').parentElement;
    expect(modalContainer).toHaveClass('max-w-md', 'w-full', 'mx-4');
  });

  // HOA-AUTH-RESP-PASS-002: Test tablet responsiveness
  test('renders correctly on tablet viewport', async () => {
    global.innerWidth = 800;
    global.dispatchEvent(new Event('resize'));

    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    const modalContainer = screen.getByRole('heading', { name: /reset password/i }).closest('div').parentElement;
    expect(modalContainer).toHaveClass('p-6');
  });

  // HOA-AUTH-ACC-PASS-001: Test accessibility
  test('meets accessibility requirements', async () => {
    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    // Check form labeling
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute('id', 'forgot-email');
    
    // Check button accessibility
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toHaveAttribute('type', 'button');
  });

  // Test error handling
  test('handles API errors appropriately', async () => {
    const errorMessage = 'Failed to process password reset request. Please try again.';
    authService.forgotPassword.mockRejectedValueOnce(new Error('API Error'));

    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    await userEvent.type(screen.getByPlaceholderText(/enter your email address/i), 'test@example.com');
    const form = screen.getByTestId('forgot-password-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // Test loading state
  test('displays loading state during API call', async () => {
    authService.forgotPassword.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    await userEvent.type(screen.getByPlaceholderText(/enter your email address/i), 'test@example.com');
    const form = screen.getByTestId('forgot-password-form');
    fireEvent.submit(form);

    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  // Test close functionality
  test('closes modal when cancel button is clicked', async () => {
    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test close functionality with X button
  test('closes modal when X button is clicked', async () => {
    render(
      <ForgotPasswordModal onClose={mockOnClose} />,
      { wrapper: TestWrapper }
    );

    const closeButton = screen.getByRole('button', { name: '' });
    await userEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});