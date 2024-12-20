import React, { useState, useEffect } from 'react';
import { CreditCard, Trash2, Star, PlusCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

const CardManagementModal = ({ accountId, onClose }) => {
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ cardNumber: '', expiryMonth: '', expiryYear: '', cardType: '', nickname: '' });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardNumberError, setCardNumberError] = useState('');
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchCards();
  }, [accountId]);

  const fetchCards = async () => {
    try {
      const response = await apiService.getCards(accountId);
      setCards(response);
    } catch (error) {
      setError('Failed to fetch cards. Please try again.');
      console.error('Error fetching cards:', error);
    }
  };

  const handleSetDefault = async (cardId) => {
    try {
      await apiService.setDefaultCard(cardId);
      fetchCards();
    } catch (error) {
      setError('Failed to set default card. Please try again.');
      console.error('Error setting default card:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await apiService.deleteCard(cardId);
      fetchCards();
    } catch (error) {
      setError('Failed to delete card. Please try again.');
      console.error('Error deleting card:', error);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    
    // Validate card number length before submitting
    if (newCard.cardNumber.length !== 16) {
      setCardNumberError('Card number must be 16 digits');
      return;
    }

    try {
      await apiService.addCard(accountId, newCard);
      setIsAddingCard(false);
      setNewCard({ cardNumber: '', expiryMonth: '', expiryYear: '', cardType: '', nickname: '' });
      setCardNumberError('');
      fetchCards();
    } catch (error) {
      setError('Failed to add card. Please try again.');
      console.error('Error adding card:', error);
    }
  };

  const validateCardNumber = (number) => {
    // Remove any non-numeric characters
    const numericValue = number.replace(/\D/g, '');
    
    // Only update if numeric and not longer than 16 digits
    if (/^\d{0,16}$/.test(numericValue)) {
      setNewCard({...newCard, cardNumber: numericValue});
      
      // Clear error if valid length, otherwise set error
      if (numericValue.length === 16) {
        setCardNumberError('');
      } else {
        setCardNumberError('Card number must be 16 digits');
      }
    }
  };

  const inputClass = `w-full p-2 rounded-lg ${
    isDarkMode
      ? 'bg-mutedolive text-darkolive placeholder-darkolive'
      : 'bg-palebluegrey text-darkblue-light placeholder-darkblue-light'
  }`;

  const cardFormSection = (
    <form onSubmit={handleAddCard} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Card Number"
          value={newCard.cardNumber}
          onChange={(e) => validateCardNumber(e.target.value)}
          className={`${inputClass} ${cardNumberError ? 'border-red-500' : ''}`}
          maxLength={16}
          required
        />
        {cardNumberError && (
          <p className="text-red-500 text-sm mt-1">{cardNumberError}</p>
        )}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="MM"
          value={newCard.expiryMonth}
          onChange={(e) => setNewCard({...newCard, expiryMonth: e.target.value})}
          className={`w-1/4 ${inputClass}`}
          maxLength={2}
          required
        />
        <input
          type="text"
          placeholder="YYYY"
          value={newCard.expiryYear}
          onChange={(e) => setNewCard({...newCard, expiryYear: e.target.value})}
          className={`w-1/4 ${inputClass}`}
          maxLength={4}
          required
        />
      </div>

      <input
        type="text"
        placeholder="Card Type (e.g., Visa, Mastercard)"
        value={newCard.cardType}
        onChange={(e) => setNewCard({...newCard, cardType: e.target.value})}
        className={inputClass}
        required
      />
      <input
        type="text"
        placeholder="Nickname (optional)"
        value={newCard.nickname}
        onChange={(e) => setNewCard({...newCard, nickname: e.target.value})}
        className={inputClass}
      />
      <button 
        type="submit" 
        className={`w-full p-2 rounded-lg ${
          isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light'
        }`}
        disabled={!!cardNumberError || newCard.cardNumber.length !== 16}
      >
        Add Card
      </button>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-md w-full`}>
        <h2 className="text-2xl font-bold mt-16 lg:mt-0 mb-4">Manage Payment Methods</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-4 mb-4">
          {cards.map((card) => (
            <div key={card.CARD_ID} className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'}`}>
              <div className={`flex items-center space-x-4 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                <CreditCard />
                <div>
                  <p className="font-medium">{card.CARD_TYPE} ending in {card.CARD_NUMBER_LAST_4}</p>
                  <p className="text-sm">Expires: {card.EXPIRY_MONTH}/{card.EXPIRY_YEAR}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSetDefault(card.CARD_ID)}
                  className={`p-2 rounded-lg ${card.IS_DEFAULT ? 'text-yellow-500' : 'text-gray-400'} hover:bg-opacity-80`}
                >
                  <Star />
                </button>
                <button
                  onClick={() => handleDeleteCard(card.CARD_ID)}
                  className="p-2 rounded-lg text-red-500 hover:bg-opacity-80"
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
        {isAddingCard ? cardFormSection : (
          <button
            onClick={() => setIsAddingCard(true)}
            className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light'} flex items-center justify-center`}
          >
            <PlusCircle className="mr-2" />
            Add New Card
          </button>
        )}
        <button
          onClick={onClose}
          className={`mt-4 w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CardManagementModal;