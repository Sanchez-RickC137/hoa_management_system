import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';
import { X, Download, Printer } from 'lucide-react';
import PaymentReceipt from './PaymentReceipt';

const PaymentHistoryModal = ({ payment, onClose }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const formattedDate = new Date(payment.date).toISOString().split('T')[0];
        const positiveAmount = payment.amount.replace(/[()-]/g, '').trim();
        console.log('Fetching payment details for:', { date: formattedDate, amount: positiveAmount });
        const response = await apiService.getPaymentDetailsByDateAndAmount(formattedDate, positiveAmount);
        console.log('Payment details response:', response);
        setPaymentDetails(response);
      } catch (error) {
        console.error('Error fetching payment details:', error);
        setError('Failed to load payment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [payment.date, payment.amount]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    // First ensure receipt is visible
    setShowReceipt(true);
    
    // Use setTimeout to ensure the receipt is rendered
    setTimeout(() => {
      const receiptContent = document.getElementById('printable-receipt');
      if (!receiptContent) {
        console.error('Receipt content not found');
        return;
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt - Summit Ridge HOA</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .receipt-content { width: 100%; max-width: 8.5in; margin: 0 auto; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-content">
              ${receiptContent.innerHTML}
            </div>
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }, 100); // Short delay to ensure content is rendered
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} p-6 rounded-lg shadow-lg`}>
        Loading...
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} p-6 rounded-lg shadow-lg`}>
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={onClose}
          className={`mt-4 px-4 py-2 rounded-lg ${
            isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${
        isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'
      } p-6 rounded-lg shadow-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
          }`}>
            Payment Details
          </h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        {paymentDetails && (
          <>
            <div className="flex justify-end space-x-4 mb-6">
              <button 
                onClick={handlePrint}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isDarkMode 
                    ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                    : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                }`}
              >
                <Printer className="mr-2" size={20} />
                Print Receipt
              </button>
              <button 
                onClick={() => setShowReceipt(!showReceipt)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                    : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                }`}
              >
                {showReceipt ? 'Hide Receipt' : 'View Receipt'}
              </button>
            </div>

            {showReceipt ? (
              <div id="printable-receipt">
                <PaymentReceipt payment={paymentDetails} />
              </div>
            ) : (
              <div className={`space-y-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-bold text-lg mb-2">Payment Information</p>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'}`}>
                      <p><strong>Payment ID:</strong> #{paymentDetails.paymentId.toString().padStart(6, '0')}</p>
                      <p><strong>Date:</strong> {formatDate(paymentDetails.paymentDate)}</p>
                      <p><strong>Amount:</strong> ${parseFloat(paymentDetails.amount).toFixed(2)}</p>
                      <p><strong>Description:</strong> {paymentDetails.description}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-lg mb-2">Account Details</p>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'}`}>
                      <p><strong>Account Number:</strong> {paymentDetails.accountId}</p>
                      {paymentDetails.cardType && (
                        <>
                          <p><strong>Payment Method:</strong> {paymentDetails.cardType}</p>
                          <p><strong>Card Number:</strong> **** **** **** {paymentDetails.cardLastFour}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryModal;