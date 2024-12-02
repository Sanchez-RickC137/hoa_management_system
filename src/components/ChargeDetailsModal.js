import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';
import { X } from 'lucide-react';

const ChargeDetailsModal = ({ chargeId, onClose }) => {
  const [chargeDetails, setChargeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchChargeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching charge details for:', { chargeId });
        const response = await apiService.getChargeDetails(chargeId);
        setChargeDetails(response);
      } catch (error) {
        console.error('Error fetching charge details:', error);
        setError('Failed to load charge details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchChargeDetails();
  }, [chargeId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-md w-full m-4`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Charge Details</h2>
          <button onClick={onClose}><X /></button>
        </div>
        {chargeDetails && (
          <div className="space-y-4">
            <p><strong>Account ID:</strong> {chargeDetails.accountId}</p>
            {chargeDetails.assessDate && (
              <p><strong>Assessment Date:</strong> {formatDate(chargeDetails.assessDate)}</p>
            )}
            {chargeDetails.assessmentDescription && (
              <p><strong>Assessment Description:</strong> {chargeDetails.assessmentDescription}</p>
            )}
            {chargeDetails.violationDescription && (
              <p><strong>Violation Description:</strong> {chargeDetails.violationDescription}</p>
            )}
            <p><strong>Amount:</strong> ${parseFloat(chargeDetails.amount).toFixed(2)}</p>
            <p><strong>Charge ID:</strong> {chargeDetails.chargeId}</p>
            <p><strong>Due Date:</strong> {formatDate(chargeDetails.paymentDueDate)}</p>
            
            <p><strong>Issued By:</strong> {chargeDetails.issuerName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChargeDetailsModal;