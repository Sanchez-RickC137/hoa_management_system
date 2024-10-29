const { setupTestApi } = require('./testUtils');

const testMessage = async (testUser) => {
  try {
    const api = setupTestApi(testUser.OWNER_ID);

    const messageData = {
      receiverId: testUser.OWNER_ID, // Send to self for testing
      content: "This is a test message sent via SendGrid",
      parentMessageId: null
    };

    const response = await api.post('/messages', messageData);
    console.log('Message test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Message test failed:', error.response?.data || error);
    throw error;
  }
};

module.exports = { testMessage };
