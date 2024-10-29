const axios = require('axios');
const { setupTestApi } = require('./testUtils');

const testAnnouncement = async (testUser) => {
  try {
    const api = setupTestApi(testUser.OWNER_ID);

    const announcementData = {
      title: "Test Announcement",
      message: "This is a test announcement sent via SendGrid",
      type: "ANNOUNCEMENT",
      status: "PUBLISHED"
    };

    const response = await api.post('/announcements', announcementData);
    console.log('Announcement test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Announcement test failed:', error.response?.data || error);
    throw error;
  }
};

module.exports = { testAnnouncement };