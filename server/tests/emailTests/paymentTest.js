const { setupTestApi } = require('./testUtils');
require('dotenv').config();

const testPayment = async () => {
  console.log("Starting Payment Email Test");
  try {
    // Use known test user
    const TEST_USER = {
      OWNER_ID: 100730318,
      ACCOUNT_ID: 47
    };

    console.log('Setting up test API...');
    const api = setupTestApi(TEST_USER.OWNER_ID);

    // Get user's cards
    console.log('Fetching cards...');
    const cardsResponse = await api.get(`/cards/${TEST_USER.ACCOUNT_ID}`);
    console.log('Cards found:', cardsResponse.data);
    
    const card = cardsResponse.data[0];
    if (!card) {
      throw new Error('No cards found for test user');
    }

    // Make test payment
    const paymentData = {
      amount: 150.00,
      cardId: card.CARD_ID,
      accountId: TEST_USER.ACCOUNT_ID,
      description: 'Test Payment Email'
    };

    console.log('Submitting payment...', paymentData);
    const response = await api.post('/payments', paymentData);
    console.log('Payment response:', response.data);

    return true;
  } catch (error) {
    console.error('Payment email test failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return false;
  }
};

// Only run if this file is being run directly
if (require.main === module) {
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not Set');
  
  testPayment()
    .then(success => {
      console.log('Test completed:', success ? 'PASSED' : 'FAILED');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test error:', error);
      process.exit(1);
    });
}

module.exports = { testPayment };