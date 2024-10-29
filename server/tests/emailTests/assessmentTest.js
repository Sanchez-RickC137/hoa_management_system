const { setupTestApi } = require('./testUtils');

const testAssessment = async (testUser) => {
  try {
    const api = setupTestApi(testUser.OWNER_ID);

    // Get required IDs
    const [assessmentTypes, assessmentRates] = await Promise.all([
      api.get('/assessments/types'),
      api.get('/assessments/rates')
    ]);

    const assessmentData = {
      typeId: assessmentTypes.data[0].TYPE_ID,
      rateId: assessmentRates.data[0].RATE_ID,
      amount: 250.00,
      owners: [{
        ownerId: testUser.OWNER_ID,
        accountId: testUser.ACCOUNT_ID
      }],
      issuedBy: 1 // Board member ID
    };

    const response = await api.post('/assessments/issue', assessmentData);
    console.log('Assessment test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Assessment test failed:', error.response?.data || error);
    throw error;
  }
};

module.exports = { testAssessment };