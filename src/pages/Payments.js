import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CreditCard, DollarSign } from 'lucide-react';
import { apiService } from '../services/apiService';
import Sidebar from '../components/layout/Sidebar';
import PaymentModal from '../components/PaymentModal';
import CardManagementModal from '../components/CardManagementModal';
import PaymentHistoryModal from '../components/PaymentHistoryModal';
import ChargeDetailsModal from '../components/ChargeDetailsModal';

const Payments = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardManagementModal, setShowCardManagementModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAccountDetails();
      setPaymentData(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError('Failed to load payment data. Please try again later.');
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return (Math.round(parseFloat(value) * 100) / 100).toFixed(2);
  };

  const formatDate = (dateString) => {
    // Full format for md screens and up
    const fullFormat = new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Abbreviated format for small screens
    const shortFormat = new Date(dateString).toLocaleDateString('en-US', {
      // year: '2-digit',
      month: 'short',
      day: 'numeric'
    });

    return { fullFormat, shortFormat };
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

  const groupTransactionsByYear = (transactions) => {
    const sortedTransactions = [...transactions].reverse();
    return sortedTransactions.reduce((groups, transaction) => {
      const year = new Date(transaction.date).getFullYear();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(transaction);
      return groups;
    }, {});
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!paymentData) return <div>No payment data available.</div>;

  const { accountInfo, paymentHistory } = paymentData;
  const calculatedHistory = calculateRunningBalance(paymentHistory);
  const transactionsByYear = groupTransactionsByYear(calculatedHistory);
  const years = Object.keys(transactionsByYear).sort((a, b) => b - a);

  return (
    <div className={`container mx-auto flex ${isDarkMode ? 'bg-greenblack-dark text-tanish-dark' : 'bg-tanish-light text-darkblue-light'} rounded-lg shadow-lg`}>
      <Sidebar />
      <div className={`flex-1 m-4 md:m-10 pt-16 md:pt-0`}>
        {/* Added Centered Header */}
        <div className="mb-6 md:mb-10 flex justify-center">
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Account & Payments
          </h1>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div className={`p-6 ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-md`}>
            <div className="flex flex-col">
              <h2 className={`text-4xl text-center font-bold mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                Account Balance
              </h2>
              <p className={`text-4xl text-center font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                ${formatCurrency(accountInfo.balance)}
              </p>
            </div>
          </div>

          {/* Actions Card */}
          <div className={`p-6 ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-md`}>
            <div className="flex flex-col sm:flex-row justify-evenly gap-4 h-full items-center">
              <button
                onClick={() => setShowPaymentModal(true)}
                className={`w-full sm:w-auto flex items-center justify-center px-8 py-4 text-lg rounded-lg ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}
              >
                <DollarSign className="mr-2 h-6 w-6" />
                Make a Payment
              </button>
              <button
                onClick={() => setShowCardManagementModal(true)}
                className={`w-full sm:w-auto flex items-center justify-center px-8 py-4 text-lg rounded-lg ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}
              >
                <CreditCard className="mr-2 h-6 w-6" />
                Manage Cards
              </button>
            </div>
          </div>
        </div>
        
        {years.map(year => (
          <div key={year} className="mb-8">
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              {year}
            </h3>
            <div className={`p-2 md:p-6 ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-md overflow-x-auto`}>
              <table className={`w-full border-collapse ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'} rounded-lg`}>
                {/* Desktop View Structure */}
                <colgroup className="hidden md:table-column-group">
                  <col className="w-[160px]" /> {/* Date */}
                  <col className="w-[100px]" /> {/* Type */}
                  <col /> {/* Description - flex grow */}
                  <col className="w-[120px]" /> {/* Amount */}
                  <col className="w-[120px]" /> {/* Balance */}
                  <col className="w-[120px]" /> {/* Details */}
                </colgroup>

                {/* Mobile View Structure */}
                <colgroup className="md:hidden">
                  <col className="w-1/3" /> {/* Date */}
                  <col className="w-1/3" /> {/* Type */}
                  <col className="w-1/3" /> {/* Details */}
                </colgroup>

                {/* Table Headers */}
                <thead>
                  {/* Desktop Headers */}
                  <tr className="hidden md:table-row text-left">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Description</th>
                    <th className="p-4 font-semibold text-right">Amount</th>
                    <th className="p-4 font-semibold text-right">Balance</th>
                    <th className="p-4 font-semibold text-center">Details</th>
                  </tr>

                  {/* Mobile Headers */}
                  <tr className="md:hidden text-left">
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold text-center">Type</th>
                    <th className="p-3 font-semibold text-right">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {transactionsByYear[year].map((item, index) => {
                    const { fullFormat, shortFormat } = formatDate(item.date);
                    
                    const TypeBadge = ({ isMobile = false }) => (
                      <span 
                        className={`
                          ${isMobile ? 'w-8 h-8' : 'px-3 py-1'} 
                          ${isMobile ? 'inline-flex items-center justify-center' : 'inline-block'} 
                          rounded-full text-center
                          ${item.type === 'payment' 
                            ? isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light'
                            : 'bg-red-500 text-white'}
                        `}
                      >
                        {isMobile ? (item.type === 'payment' ? 'P' : 'C') : (item.type === 'payment' ? 'Payment' : 'Charge')}
                      </span>
                    );

                    return (
                      <React.Fragment key={index}>
                        {/* Desktop Row */}
                        <tr className={`hidden md:table-row border-t ${isDarkMode ? 'border-tanish-dark' : 'border-darkblue-light'} hover:bg-opacity-80`}>
                          <td className="p-4 whitespace-nowrap">{fullFormat}</td>
                          <td className="p-4"><TypeBadge /></td>
                          <td className="p-4 break-words">{item.description}</td>
                          <td className="p-4 text-right whitespace-nowrap">
                            {item.type === 'charge' 
                              ? <span className="text-red-500">(${formatCurrency(item.amount)})</span>
                              : <span className="text-green-500">${formatCurrency(item.amount)}</span>
                            }
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">${item.balance}</td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => setSelectedTransaction(item)}
                              className={`text-sm px-4 py-1 rounded ${
                                isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                              }`}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>

                        {/* Mobile Row */}
                        <tr className={`md:hidden border-t ${isDarkMode ? 'border-tanish-dark' : 'border-darkblue-light'} hover:bg-opacity-80`}>
                          <td className="p-3 text-left whitespace-nowrap">{shortFormat}</td>
                          <td className="p-3 text-center"><TypeBadge isMobile={true} /></td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => setSelectedTransaction(item)}
                              className={`text-sm px-4 py-1 rounded ${
                                isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                              }`}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {showPaymentModal && (
        <PaymentModal
          accountInfo={accountInfo}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSubmit={() => {
            setShowPaymentModal(false);
            fetchPaymentData();
          }}
        />
      )}

      {showCardManagementModal && (
        <CardManagementModal
          accountId={accountInfo.accountNumber}
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

export default Payments;