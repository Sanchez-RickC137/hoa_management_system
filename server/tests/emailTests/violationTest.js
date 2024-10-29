const { setupTestApi } = require('./testUtils');

const testViolation = async (testUser) => {
  try {
    const api = setupTestApi(testUser.OWNER_ID);

    // First get a valid violation type
    const violationTypesResponse = await api.get('/violation-types');
    const violationType = violationTypesResponse.data[0];

    const violationData = {
      ownerId: testUser.OWNER_ID,
      violationTypeId: violationType.TYPE_ID,
      violationDate: new Date().toISOString().split('T')[0]
    };

    const response = await api.post('/violations', violationData);
    console.log('Violation test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Violation test failed:', error.response?.data || error);
    throw error;
  }
};

module.exports = { testViolation };