import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';
import Sidebar from '../components/layout/Sidebar';
import { CreditCard, DollarSign } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import CardManagementModal from '../components/CardManagementModal';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import ChargeDetailsModal from '../components/ChargeDetailsModal';

const AccountPage = () => {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardManagementModal, setShowCardManagementModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAccountDetails();
      console.log('API response:', response);
      setAccountData(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching account data:', error);
      setError('Failed to load account data. Please try again later.');
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (paymentResponse) => {
    console.log('Payment response:', paymentResponse);
    try {
      // Fetch the updated account data after payment
      await fetchAccountData();
    } catch (error) {
      console.error('Error updating account data after payment:', error);
      setError('Payment processed, but failed to update account information. Please refresh the page.');
    }
  };

  const formatCurrency = (value) => {
    return (Math.round(parseFloat(value) * 100) / 100).toFixed(2);
  };

  const calculateRunningBalance = (transactions) => {
    let runningBalance = 0;
    return transactions.map(item => {
      if (item.type === 'charge') {
        runningBalance += parseFloat(item.amount);
      } else {
        runningBalance -= parseFloat(item.amount);
      }
      return { ...item, balance: formatCurrency(runningBalance) };
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!accountData) {
    return <div>No account data available.</div>;
  }

  const { accountInfo, paymentHistory } = accountData;

  return (
    <div className={`flex ${isDarkMode ? 'bg-greenblack-dark text-tanish-dark' : 'bg-tanish-light text-darkblue-light'} rounded-lg shadow-lg`}>
      <Sidebar />
      <div className="flex-1 p-10">
        <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Account Details</h1>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8`}>
          <div className={`p-6 ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-md`}>
            <h2 className={`text-xl text-center font-semibold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Account Information</h2>
            <div className={`p-2 w-full border-collapse ${isDarkMode ? 'bg-mutedolive border-tanish-dark text-darkolive' : 'bg-palebluegrey border-darkblue-light text-darkblue-light'} rounded-lg shadow-lg`}>
              <p><strong>Account Number:</strong> {accountInfo?.accountNumber || 'N/A'}</p>
              <p><strong>Address:</strong> {accountInfo?.address || 'N/A'}</p>
              <p><strong>Current Balance:</strong> ${formatCurrency(accountInfo?.balance)}</p>
              <p><strong>Last Payment:</strong> {
                accountInfo?.lastPaymentAmount && accountInfo?.lastPaymentDate
                  ? `$${formatCurrency(accountInfo.lastPaymentAmount)} on ${new Date(accountInfo.lastPaymentDate).toLocaleDateString()}`
                  : 'No recent payments'
              }</p>
            </div>
          </div>
          
          <div className={`p-6 ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-md`}>
            <h2 className={`text-xl text-center font-semibold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowPaymentModal(true)}
                className={`flex items-center justify-center p-6 ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} rounded-lg transition-colors duration-200`}
              >
                <DollarSign className="mr-2" />
                Make a Payment
              </button>
              <button
                onClick={() => setShowCardManagementModal(true)}
                className={`flex items-center justify-center p-6 ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} rounded-lg transition-colors duration-200`}
              >
                <CreditCard className="mr-2" />
                Manage Cards
              </button>
            </div>
          </div>
        </div>

        {paymentHistory && paymentHistory.length > 0 ? (
          <div className={`p-6 ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-md`}>
            <h2 className={`text-xl text-center font-semibold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Payment History</h2>
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${isDarkMode ? 'bg-mutedolive border-tanish-dark text-darkolive' : 'bg-palebluegrey border-darkblue-light text-darkblue-light'} rounded-lg shadow-lg`}>
                <thead>
                  <tr>
                    <th className={`p-2 text-left border-b ${isDarkMode ? 'border-tanish-dark' : 'border-darkblue-light'}`}>Date</th>
                    <th className={`p-2 text-left border-b ${isDarkMode ? 'border-tanish-dark' : 'border-darkblue-light'}`}>Description</th>
                    <th className={`p-2 text-left border-b ${isDarkMode ? 'border-tanish-dark' : 'border-darkblue-light'}`}>Amount</th>
                    <th className={`p-2 text-left border-b ${isDarkMode ? 'border-tanish-dark' : 'border-darkblue-light'}`}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateRunningBalance(paymentHistory).map((item, index) => (
                    <tr 
                      key={index} 
                      className={`${isDarkMode ? 'border-tanish-dark' : 'border-darkblue-light'} border-t cursor-pointer hover:bg-opacity-80`}
                      onClick={() => setSelectedTransaction(item)}
                    >
                      <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">
                        {item.type === 'charge' ? (
                          <span className="">(${formatCurrency(item.amount)})</span>
                        ) : (
                          <span className="">${formatCurrency(item.amount)}</span>
                        )}
                      </td>
                      <td className="p-2">${item.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p>No payment history available.</p>
        )}
      </div>
      {showPaymentModal && (
        <PaymentModal
          accountInfo={accountData.accountInfo}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSubmit={handlePaymentSubmit}
        />
      )}
      {showCardManagementModal && (
        <CardManagementModal
          accountId={accountInfo?.accountNumber}
          onClose={() => setShowCardManagementModal(false)}
        />
      )}
      {selectedTransaction && selectedTransaction.type === 'payment' && (
        <PaymentHistoryModal
          payment={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
      {selectedTransaction && selectedTransaction.type === 'charge' && (
        <ChargeDetailsModal
          charge={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default AccountPage;