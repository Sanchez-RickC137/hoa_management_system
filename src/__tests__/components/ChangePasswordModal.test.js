// src/__tests__/components/ChangePasswordModal.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import * as apiService from '../../services/apiService';

jest.mock('../../services/apiService', () => ({
  apiService: {
    changePassword: jest.fn()
  }
}));

describe('ChangePasswordModal Component', () => {
  const mockUser = { id: 1, email: 'test@example.com' };
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const renderModal = () => {
    return render(
      <ThemeProvider>
        <ChangePasswordModal 
          user={mockUser}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles successful password change', async () => {
    apiService.apiService.changePassword.mockResolvedValueOnce({ success: true });
    renderModal();

    const newPassInput = screen.getByTestId('new-password-input');
    const confirmPassInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    fireEvent.change(newPassInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmPassInput, { target: { value: 'StrongPass123!' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiService.apiService.changePassword).toHaveBeenCalledWith(
        mockUser.id, 
        'StrongPass123!'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test('handles password mismatch', async () => {
    renderModal();

    const newPassInput = screen.getByTestId('new-password-input');
    const confirmPassInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    fireEvent.change(newPassInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmPassInput, { target: { value: 'DifferentPass123!' } });
    
    fireEvent.click(submitButton);

    // The API call should not be made if passwords don't match
    expect(apiService.apiService.changePassword).not.toHaveBeenCalled();
  });

  test('handles password change errors', async () => {
    apiService.apiService.changePassword.mockRejectedValueOnce(new Error('Failed to change password'));
    renderModal();

    const newPassInput = screen.getByTestId('new-password-input');
    const confirmPassInput = screen.getByTestId('confirm-password-input');
    const submitButton = screen.getByRole('button', { name: /change password/i });

    fireEvent.change(newPassInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmPassInput, { target: { value: 'StrongPass123!' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to change password/i)).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  test('closes modal when X button is clicked', () => {
    renderModal();
    // Use a data-testid to find the close button
    const closeButton = screen.getByTestId('modal-close-button');
    
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});