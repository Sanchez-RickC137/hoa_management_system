import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CreditCard } from 'lucide-react';
import { apiService } from '../services/apiService';

const PaymentModal = ({ accountInfo, onClose, onPaymentSubmit }) => {
	const [step, setStep] = useState(1);
	const [paymentAmount, setPaymentAmount] = useState('0.00');
  const [paymentDescription, setPaymentDescription] = useState('');
	const [selectedCard, setSelectedCard] = useState(null);
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const { isDarkMode } = useTheme();
  
	useEffect(() => {
	  const fetchCards = async () => {
		try {
		  setLoading(true);
		  const response = await apiService.getCards(accountInfo.accountNumber);
		  console.log('Fetched cards:', response);
		  setCards(response);
		  if (response.length > 0) {
			const defaultCard = response.find(card => card.IS_DEFAULT) || response[0];
			setSelectedCard(defaultCard.CARD_ID);
		  }
		  setLoading(false);
		} catch (error) {
		  console.error('Error fetching cards:', error);
		  setError('Failed to load payment methods');
		  setLoading(false);
		}
	  };
  
	  fetchCards();
	}, [accountInfo.accountNumber]);

	const handlePaymentSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const paymentData = {
        amount: parseFloat(paymentAmount),
        description: paymentDescription || 'Payment',
        cardId: selectedCard,
        accountId: accountInfo.accountNumber,
        timestamp: new Date().toISOString() // Include exact timestamp
      };

      const response = await apiService.submitPayment(paymentData);
      
      if (response.success) {
        // Ensure the parent component gets updated
        await onPaymentSubmit(response);
      } else {
        setError('Payment failed to process. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handlePaymentSubmit();
    }
  };

  const buttonStyle = `px-6 py-3 rounded-lg ${
    isDarkMode
      ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark'
      : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
  }`;

  const renderStep = () => {
    if (loading) {
      return <div>Loading payment methods...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between">
              <span>Account: {accountInfo.accountNumber}</span>
              <span>Balance: ${accountInfo.balance}</span>
            </div>
            <div>
              <label className="block mb-2">Payment Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-3">$</span>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={`w-full p-2 pl-8 rounded-lg border ${
                    isDarkMode ? 'bg-mutedolive border-tanish-dark text-darkolive' : 'bg-palebluegrey border-darkblue-light'
                  }`}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2">Payment Description</label>
              <input
                type="text"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
                placeholder="e.g., Monthly Dues Payment"
                className={`w-full p-2 rounded-lg border ${
                  isDarkMode ? 'bg-mutedolive border-tanish-dark text-darkolive' : 'bg-palebluegrey border-darkblue-light'
                }`}
              />
            </div>
          </div>
        );

		case 2:
			return (
			  <div className="space-y-4">
				<h3 className="font-bold mb-4">Select Payment Method</h3>
				{cards.length > 0 ? (
				  cards.map((card) => (
					<div
					  key={card.CARD_ID}
					  onClick={() => setSelectedCard(card.CARD_ID)}
					  className={`p-4 rounded-lg cursor-pointer border ${
						selectedCard === card.CARD_ID
						  ? isDarkMode ? 'border-tanish-dark bg-mutedolive' : 'border-darkblue-light bg-palebluegrey'
						  : 'border-gray-300'
					  }`}
					>
					  <div className="flex items-center space-x-4">
						<CreditCard />
						<div>
						  <p>{card.CARD_TYPE} ending in {card.CARD_NUMBER_LAST_4}</p>
						  <p className="text-sm">Expires: {card.EXPIRY_MONTH}/{card.EXPIRY_YEAR}</p>
						</div>
					  </div>
					</div>
				  ))
				) : (
				  <div>No payment methods available. Please add a card.</div>
				)}
			  </div>
			);
		case 3:
        const selectedCardInfo = cards.find(card => card.CARD_ID === selectedCard);
        return (
          <div className="space-y-6">
            <h3 className="font-bold mb-4">Confirm Payment</h3>
            <div className="space-y-2">
              <p>Amount: ${paymentAmount}</p>
              <p>Card: {selectedCardInfo?.CARD_TYPE} ending in {selectedCardInfo?.CARD_NUMBER_LAST_4}</p>
              <p>Account: {accountInfo.accountNumber}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-md w-full`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Make a Payment</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex flex-col items-center ${step >= i ? 'text-tanish-dark' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full ${
                step >= i 
                  ? isDarkMode ? 'bg-darkblue-dark' : 'bg-greenblack-light'
                  : 'bg-gray-300'
              } flex items-center justify-center text-white font-bold mb-2`}>
                {i}
              </div>
              <span className="text-xs">
                {i === 1 ? 'AMOUNT' : i === 2 ? 'PAYMENT METHOD' : 'CONFIRM'}
              </span>
            </div>
          ))}
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          <button
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className={buttonStyle}
            disabled={submitting}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={handleContinue}
            className={buttonStyle}
            disabled={loading || submitting || error || (step === 2 && cards.length === 0)}
          >
            {step === 3 ? (submitting ? 'Processing...' : 'Submit Payment') : 'Continue'}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default PaymentModal;