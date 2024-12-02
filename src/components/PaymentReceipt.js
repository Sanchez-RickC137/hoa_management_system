import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import LogoLight from '../assets/images/SummitRidgeLogoLight.png';
import LogoDark from '../assets/images/SummitRidgeLogoDark.png';

const PaymentReceipt = ({ payment, printMode = false }) => {
  const { isDarkMode } = useTheme();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const receiptStyle = printMode ? {
    width: '8.5in',
    minHeight: '11in',
    padding: '0.5in',
    margin: '0 auto',
    backgroundColor: 'white',
    color: 'black'
  } : {};

  return (
    <div 
      className={`flex flex-col ${
        printMode ? '' : isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
      } p-8 rounded-lg`}
      style={receiptStyle}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <img 
            src={printMode ? LogoLight : (isDarkMode ? LogoLight : LogoDark)} 
            alt="Summit Ridge Logo" 
            className="h-16 mb-4"
          />
          <h1 className={`text-2xl font-bold ${printMode ? 'text-black' : ''}`}>
            Payment Receipt
          </h1>
        </div>
        <div className={`text-right ${printMode ? 'text-black' : ''}`}>
          <p>Summit Ridge HOA</p>
          <p>123 Summit Ridge Drive</p>
          <p>Summit City, ST 12345</p>
          <p>(555) 123-4567</p>
        </div>
      </div>

      {/* Receipt Info */}
      <div className={`grid grid-cols-2 gap-4 mb-8 ${printMode ? 'text-black' : ''}`}>
        <div>
          <p className="font-bold">Receipt Number:</p>
          <p>#{payment.paymentId.toString().padStart(6, '0')}</p>
        </div>
        <div>
          <p className="font-bold">Date:</p>
          <p>{formatDate(payment.paymentDate)}</p>
        </div>
        <div>
          <p className="font-bold">Account Number:</p>
          <p>{payment.accountId}</p>
        </div>
        <div>
          <p className="font-bold">Payment Method:</p>
          <p>{payment.cardType} ending in {payment.cardLastFour}</p>
        </div>
      </div>

      {/* Payment Details */}
      <div className={`mb-8 ${printMode ? 'text-black' : ''}`}>
        <div className={`grid grid-cols-1 gap-4 p-4 rounded-lg ${
          printMode ? 'border' : isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-dark'
        }`}>
          <div className="grid grid-cols-2 gap-4 border-b pb-2">
            <p className="font-bold">Description</p>
            <p className="font-bold text-right">Amount</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <p>{payment.description}</p>
            <p className="text-right">{formatCurrency(payment.amount)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-2">
            <p className="font-bold">Total Amount Paid</p>
            <p className="font-bold text-right">{formatCurrency(payment.amount)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`mt-auto ${printMode ? 'text-black' : ''}`}>
        <p className="text-center text-sm mb-2">
          Thank you for your payment. This receipt serves as confirmation of your payment to Summit Ridge HOA.
        </p>
        <p className="text-center text-sm">
          Please retain this receipt for your records.
        </p>
        {!printMode && (
          <div className="mt-4 text-center">
            <small className="opacity-75">
              A copy of this receipt has been sent to your email address on file.
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReceipt;