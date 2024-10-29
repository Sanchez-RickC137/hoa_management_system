// src/services/apiService.js
import { axiosPublic, axiosPrivate } from './axiosConfig';

class ApiService {
  // Helper method for logging
  logApiCall(method, endpoint, data = null) {
    console.log(`API ${method} Request:`, {
      endpoint,
      data: data || 'No data',
      timestamp: new Date().toISOString()
    });
  }

  // Helper method for error handling
  handleError(error, operation) {
    console.error(`Error in ${operation}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });
    throw error;
  }

  // User & Profile
  async getProfile() {
    try {
      this.logApiCall('GET', '/profile');
      const response = await axiosPrivate.get('/profile');
      console.log('Profile data received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getProfile');
    }
  }

  async getDashboard() {
    try {
      this.logApiCall('GET', '/dashboard');
      const response = await axiosPrivate.get('/dashboard');
      console.log('Dashboard data received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getDashboard');
    }
  }

  // Account Management
  async getAccountDetails() {
    try {
      this.logApiCall('GET', '/account-details');
      const response = await axiosPrivate.get('/account-details');
      console.log('Account details received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getAccountDetails');
    }
  }

  async getCards(accountId) {
    try {
      this.logApiCall('GET', `/cards/${accountId}`);
      const response = await axiosPrivate.get(`/cards/${accountId}`);
      console.log('Cards received for account:', accountId, response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `getCards for account ${accountId}`);
    }
  }

  async addCard(accountId, cardData) {
    try {
      this.logApiCall('POST', `/cards/${accountId}`, cardData);
      const response = await axiosPrivate.post(`/cards/${accountId}`, cardData);
      console.log('Card added successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `addCard for account ${accountId}`);
    }
  }

  async updateCard(cardId, cardData) {
    try {
      this.logApiCall('PUT', `/cards/${cardId}`, cardData);
      const response = await axiosPrivate.put(`/cards/${cardId}`, cardData);
      console.log('Card updated successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `updateCard for card ${cardId}`);
    }
  }

  async deleteCard(cardId) {
    try {
      this.logApiCall('DELETE', `/cards/${cardId}`);
      const response = await axiosPrivate.delete(`/cards/${cardId}`);
      console.log('Card deleted successfully:', cardId);
      return response.data;
    } catch (error) {
      this.handleError(error, `deleteCard for card ${cardId}`);
    }
  }

  async setDefaultCard(cardId) {
    try {
      this.logApiCall('PUT', `/cards/${cardId}/default`);
      const response = await axiosPrivate.put(`/cards/${cardId}/default`);
      console.log('Default card set successfully:', cardId);
      return response.data;
    } catch (error) {
      this.handleError(error, `setDefaultCard for card ${cardId}`);
    }
  }

  // Payments
  async submitPayment(paymentData) {
    try {
      this.logApiCall('POST', '/payments', paymentData);
      const response = await axiosPrivate.post('/payments', paymentData);
      console.log('Payment submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'submitPayment');
    }
  }

  async getPaymentHistory() {
    try {
      this.logApiCall('GET', '/payments/history');
      const response = await axiosPrivate.get('/payments/history');
      console.log('Payment history received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getPaymentHistory');
    }
  }

  async getPaymentDetailsByDateAndAmount(date, amount) {
    try {
      this.logApiCall('GET', '/payments/details', { date, amount });
      const response = await axiosPrivate.get('/payments/details', { 
        params: { date, amount } 
      });
      console.log('Payment details received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `getPaymentDetailsByDateAndAmount for date ${date} and amount ${amount}`);
    }
  }

  async getChargeDetailsByDateAndAmount(date, amount) {
    try {
      this.logApiCall('GET', '/charges/details', { date, amount });
      const response = await axiosPrivate.get('/charges/details', { 
        params: { date, amount } 
      });
      console.log('Charge details received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `getChargeDetailsByDateAndAmount for date ${date} and amount ${amount}`);
    }
  }

  // Password & Security
  async changePassword(userId, newPassword) {
    try {
      this.logApiCall('POST', '/change-password', { userId });
      const response = await axiosPrivate.post('/change-password', { userId, newPassword });
      console.log('Password changed successfully for user:', userId);
      return response.data;
    } catch (error) {
      this.handleError(error, `changePassword for user ${userId}`);
    }
  }

  // User Management
  async getOwnerDetails() {
    try {
      this.logApiCall('GET', '/owner/details');
      const response = await axiosPrivate.get('/owner/details');
      console.log('Owner details received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getOwnerDetails');
    }
  }

  async updateOwnerPersonalInfo(data) {
    try {
      this.logApiCall('PUT', '/owner/personal-info', {
        firstName: data.FIRST_NAME,
        lastName: data.LAST_NAME
      });
      const response = await axiosPrivate.put('/owner/personal-info', {
        firstName: data.FIRST_NAME,
        lastName: data.LAST_NAME
      });
      console.log('Owner personal info updated successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'updateOwnerPersonalInfo');
    }
  }

  async updateOwnerContactInfo(data) {
    try {
      this.logApiCall('PUT', '/owner/contact-info', {
        email: data.EMAIL,
        phone: data.PHONE
      });
      const response = await axiosPrivate.put('/owner/contact-info', {
        email: data.EMAIL,
        phone: data.PHONE
      });
      console.log('Owner contact info updated successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'updateOwnerContactInfo');
    }
  }

  async updateNotificationPreferences(preferences) {
    console.log('API Service sending preferences:', preferences);
    try {
      const response = await axiosPrivate.put('/owner/notification-preferences', preferences);
      console.log('API Service received response:', response);
      return response;
    } catch (error) {
      console.error('API Service error:', error);
      // Log the actual error response if it exists
      if (error.response) {
        console.error('Error response:', error.response);
      }
      throw error;
    }
  }

  // Messages
  async getMessages() {
    try {
      this.logApiCall('GET', '/messages');
      const response = await axiosPrivate.get('/messages');
      console.log('Messages received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getMessages');
    }
  }

  async sendMessage(receiverId, content, parentMessageId = null) {
    try {
      this.logApiCall('POST', '/messages', {
        receiverId,
        content,
        parentMessageId
      });
      const response = await axiosPrivate.post('/messages', {
        receiverId,
        content,
        parentMessageId
      });
      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `sendMessage to receiver ${receiverId}`);
    }
  }

  async deleteMessage(messageId) {
    try {
      this.logApiCall('DELETE', `/messages/${messageId}`);
      const response = await axiosPrivate.delete(`/messages/${messageId}`);
      console.log('Message deleted successfully:', messageId);
      return response.data;
    } catch (error) {
      this.handleError(error, `deleteMessage for message ${messageId}`);
    }
  }

  async searchUsers(searchTerm) {
    try {
      this.logApiCall('GET', '/users', { search: searchTerm });
      const response = await axiosPrivate.get('/users', {
        params: { search: searchTerm }
      });
      console.log('Users search results:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `searchUsers with term "${searchTerm}"`);
    }
  }

  async getMessageThread(messageId) {
    try {
      this.logApiCall('GET', `/messages/thread/${messageId}`);
      const response = await axiosPrivate.get(`/messages/thread/${messageId}`);
      console.log('Message thread received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `getMessageThread for message ${messageId}`);
    }
  }

  async markMessageAsRead(messageId) {
    try {
      this.logApiCall('PUT', `/messages/${messageId}/read`);
      const response = await axiosPrivate.put(`/messages/${messageId}/read`);
      console.log('Message marked as read:', messageId);
      return response.data;
    } catch (error) {
      this.handleError(error, `markMessageAsRead for message ${messageId}`);
    }
  }

  // Announcements
  async getAnnouncements() {
    try {
      this.logApiCall('GET', '/announcements');
      const response = await axiosPrivate.get('/announcements');
      console.log('Announcements received:', response.data);
      return response.data.map(announcement => ({
        ANNOUNCEMENT_ID: announcement.ANNOUNCEMENT_ID,
        TITLE: announcement.TITLE,
        TYPE: announcement.TYPE,
        EVENT_DATE: announcement.EVENT_DATE,
        EVENT_END_DATE: announcement.EVENT_END_DATE,
        EVENT_LOCATION: announcement.EVENT_LOCATION,
        MESSAGE: announcement.MESSAGE,
        FILE_BLOB: announcement.FILE_BLOB,
        FILE_MIME: announcement.FILE_MIME,
        CREATED: announcement.CREATED,
      }));
    } catch (error) {
      this.handleError(error, 'getAnnouncements');
    }
  }

  async getAnnouncementDetails(id) {
    try {
      this.logApiCall('GET', `/announcements/${id}`);
      const response = await axiosPrivate.get(`/announcements/${id}`);
      console.log('Announcement details received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `getAnnouncementDetails for announcement ${id}`);
    }
  }

  async createAnnouncement(formData) {
    try {
      this.logApiCall('POST', '/announcements', 'FormData object');
      const response = await axiosPrivate.post('/announcements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data, headers) => {
          delete headers['Content-Type'];
          return data;
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      console.log('Announcement created successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'createAnnouncement');
    }
  }

  async updateAnnouncement(id, formData) {
    try {
      this.logApiCall('PUT', `/announcements/${id}`, 'FormData object');
      const response = await axiosPrivate.put(`/announcements/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Announcement updated successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `updateAnnouncement for announcement ${id}`);
    }
  }

  async deleteAnnouncement(id) {
    try {
      this.logApiCall('DELETE', `/announcements/${id}`);
      const response = await axiosPrivate.delete(`/announcements/${id}`);
      console.log('Announcement deleted successfully:', id);
      return response.data;
    } catch (error) {
      this.handleError(error, `deleteAnnouncement for announcement ${id}`);
    }
  }

  // Documents
  async getDocuments() {
    try {
      this.logApiCall('GET', '/documents');
      const response = await axiosPrivate.get('/documents');
      console.log('Documents received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getDocuments');
    }
  }

  async uploadDocument(formData) {
    try {
      this.logApiCall('POST', '/documents', 'FormData object');
      const response = await axiosPrivate.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Document uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'uploadDocument');
    }
  }

  async updateDocument(id, formData) {
    try {
      this.logApiCall('PUT', `/documents/${id}`, 'FormData object');
      const response = await axiosPrivate.put(`/documents/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Document updated successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `updateDocument for document ${id}`);
    }
  }

  async deleteDocument(id) {
    try {
      this.logApiCall('DELETE', `/documents/${id}`);
      const response = await axiosPrivate.delete(`/documents/${id}`);
      console.log('Document deleted successfully:', id);
      return response.data;
    } catch (error) {
      this.handleError(error, `deleteDocument for document ${id}`);
    }
  }

  async downloadDocument(id) {
    try {
      this.logApiCall('GET', `/documents/${id}/download`);
      const response = await axiosPrivate.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });
      console.log('Document downloaded successfully:', id);
      return response.data;
    } catch (error) {
      this.handleError(error, `downloadDocument for document ${id}`);
    }
  }

  // Violations
  async getViolationTypes() {
    try {
      this.logApiCall('GET', '/violation-types');
      const response = await axiosPrivate.get('/violation-types');
      console.log('Violation types received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getViolationTypes');
    }
  }

  async createViolationType(violationData) {
    try {
      this.logApiCall('POST', '/violation-types', violationData);
      const response = await axiosPrivate.post('/violation-types', violationData);
      console.log('Violation type created successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'createViolationType');
    }
  }

  async updateViolationType(typeId, violationData) {
    try {
      this.logApiCall('PUT', `/violation-types/${typeId}`, violationData);
      const response = await axiosPrivate.put(`/violation-types/${typeId}`, violationData);
      console.log('Violation type updated successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `updateViolationType for type ${typeId}`);
    }
  }

  async getActiveOwners() {
    try {
      this.logApiCall('GET', '/active-owners');
      const response = await axiosPrivate.get('/active-owners');
      console.log('Active owners received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getActiveOwners');
    }
  }

  async issueViolation(violationData) {
    try {
      this.logApiCall('POST', '/violations', violationData);
      const response = await axiosPrivate.post('/violations', violationData);
      console.log('Violation issued successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'issueViolation');
    }
  }

  // Assessment Management
  async getAssessmentTypes() {
    try {
      this.logApiCall('GET', '/assessments/types');
      const response = await axiosPrivate.get('/assessments/types');
      console.log('Assessment types received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getAssessmentTypes');
    }
  }

  async getAssessmentRates() {
    try {
      this.logApiCall('GET', '/assessments/rates');
      const response = await axiosPrivate.get('/assessments/rates');
      console.log('Assessment rates received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getAssessmentRates');
    }
  }

  async addAssessmentTypes(types) {
    try {
      this.logApiCall('POST', '/assessments/types/batch', { types });
      const response = await axiosPrivate.post('/assessments/types/batch', { types });
      console.log('Assessment types added successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'addAssessmentTypes');
    }
  }

  async addAssessmentRates(rates) {
    try {
      this.logApiCall('POST', '/assessments/rates/batch', { rates });
      const response = await axiosPrivate.post('/assessments/rates/batch', { rates });
      console.log('Assessment rates added successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'addAssessmentRates');
    }
  }

  async searchActiveOwners(searchTerm) {
    try {
      this.logApiCall('GET', '/owners/active', { search: searchTerm });
      const response = await axiosPrivate.get('/owners/active', {
        params: { search: searchTerm }
      });
      console.log('Active owners search results:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `searchActiveOwners with term "${searchTerm}"`);
    }
  }

  async getAllActiveOwners() {
    try {
      this.logApiCall('GET', '/owners/active/all');
      const response = await axiosPrivate.get('/owners/active/all');
      console.log('All active owners received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getAllActiveOwners');
    }
  }

  async issueAssessments(assessmentData) {
    try {
      this.logApiCall('POST', '/assessments/issue', assessmentData);
      const response = await axiosPrivate.post('/assessments/issue', assessmentData);
      console.log('Assessments issued successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'issueAssessments');
    }
  }

  // Board Member Management
  async verifyBoardMember() {
    try {
      this.logApiCall('GET', '/verify-board-member');
      const response = await axiosPrivate.get('/verify-board-member');
      console.log('Board member verification response:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'verifyBoardMember');
    }
  }

  async getBoardMemberRoles() {
    try {
      this.logApiCall('GET', '/board-members/roles');
      const response = await axiosPrivate.get('/board-members/roles');
      console.log('Board member roles received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getBoardMemberRoles');
    }
  }

  async updateBoardMemberRole(roleData) {
    try {
      this.logApiCall('PUT', `/board-members/roles/${roleData.MEMBER_ID}`, roleData);
      const response = await axiosPrivate.put(`/board-members/roles/${roleData.MEMBER_ID}`, roleData);
      console.log('Board member role updated successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `updateBoardMemberRole for member ${roleData.MEMBER_ID}`);
    }
  }

  async addBoardMemberRole(roleData) {
    try {
      this.logApiCall('POST', '/board-members/roles', roleData);
      const response = await axiosPrivate.post('/board-members/roles', roleData);
      console.log('Board member role added successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'addBoardMemberRole');
    }
  }

  async getActiveBoardMembers() {
    try {
      this.logApiCall('GET', '/board-members/active');
      const response = await axiosPrivate.get('/board-members/active');
      console.log('Active board members received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getActiveBoardMembers');
    }
  }

  async endBoardMemberRole(ownerId, boardMemberId) {
    try {
      this.logApiCall('PUT', `/board-members/map/${ownerId}/${boardMemberId}/end`);
      const response = await axiosPrivate.put(`/board-members/map/${ownerId}/${boardMemberId}/end`, {});
      console.log('Board member role ended successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `endBoardMemberRole for owner ${ownerId} and member ${boardMemberId}`);
    }
  }

  async addBoardMember(ownerId, roleId) {
    try {
      this.logApiCall('POST', '/board-members', { ownerId, roleId });
      const response = await axiosPrivate.post('/board-members', { ownerId, roleId });
      console.log('Board member added successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `addBoardMember for owner ${ownerId} with role ${roleId}`);
    }
  }

  // Property Management
  async getAvailableProperties() {
    try {
      this.logApiCall('GET', '/properties/available');
      const response = await axiosPrivate.get('/properties/available');
      console.log('Available properties received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getAvailableProperties');
    }
  }

  async createNewAccount(data) {
    try {
      this.logApiCall('POST', '/accounts/create', data);
      const response = await axiosPrivate.post('/accounts/create', data);
      console.log('New account created successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'createNewAccount');
    }
  }

  // Surveys
  async getSurveys() {
    try {
      this.logApiCall('GET', '/surveys');
      const response = await axiosPrivate.get('/surveys');
      console.log('Surveys received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getSurveys');
    }
  }

  async createSurvey(surveyData) {
    try {
      const data = {
        message: surveyData.message,
        answers: surveyData.answers,
        endDate: surveyData.endDate
      };
      this.logApiCall('POST', '/surveys', data);
      const response = await axiosPrivate.post('/surveys', data);
      console.log('Survey created successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'createSurvey');
    }
  }

  async submitSurveyResponse(surveyId, answerNumber) {
    try {
      this.logApiCall('POST', `/surveys/${surveyId}/responses`, { answerNumber });
      const response = await axiosPrivate.post(`/surveys/${surveyId}/responses`, {
        answerNumber
      });
      console.log('Survey response submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `submitSurveyResponse for survey ${surveyId}`);
    }
  }

  async getSurveyResults(surveyId) {
    try {
      this.logApiCall('GET', `/surveys/${surveyId}/results`);
      const response = await axiosPrivate.get(`/surveys/${surveyId}/results`);
      console.log('Survey results received:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, `getSurveyResults for survey ${surveyId}`);
    }
  }

  // System Messages
  async sendSystemMessage(messageData) {
    try {
      this.logApiCall('POST', '/contact/submit', messageData);
      const response = await axiosPrivate.post('/contact/submit', messageData);
      console.log('System message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'sendSystemMessage');
    }
  }

  // System Configuration
  async verifyEmailConfig() {
    return (await axiosPublic.get('/verify-email-config')).data;
  }
}

export const apiService = new ApiService();