const { setupTestApi } = require('./testUtils');

const testAccountCharge = async (testUser) => {
  try {
    const api = setupTestApi(testUser.OWNER_ID);

    const chargeData = {
      accountId: testUser.ACCOUNT_ID,
      amount: 75.00,
      description: 'Test Account Charge via SendGrid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const response = await api.post('/account-charges', chargeData);
    console.log('Account charge test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Account charge test failed:', error.response?.data || error);
    throw error;
  }
};

module.exports = { testAccountCharge };
