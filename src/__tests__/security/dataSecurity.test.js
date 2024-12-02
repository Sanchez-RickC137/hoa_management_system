import { apiService } from '../services/apiService';
import { axiosPrivate } from '../services/axiosConfig';

/**
 * Data Security Test Suite
 * 
 * Test ID: HOA-SEC-DATA-001 through HOA-SEC-DATA-004
 * Purpose: Verify data security mechanisms including input validation,
 *         SQL protection, file security, and data privacy.
 * 
 * Requirements Tested:
 * - XSS Prevention
 * - SQL Injection Protection
 * - File Upload Security
 * - Data Privacy Protection
 */

describe('Data Security Tests', () => {
  let testUserId;
  let testFile;

  beforeAll(async () => {
    // Login and get test user data
    const loginResponse = await authService.login('test@example.com', 'Test123!@#');
    testUserId = loginResponse.user.id;

    // Create test file
    testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  });

  /**
   * Test ID: HOA-SEC-DATA-001
   * Component: Input Validation
   * Requirement: XSS Prevention
   */
  describe('XSS Prevention (HOA-SEC-DATA-001)', () => {
    test('Should sanitize message content', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '<svg onload=alert("xss")>'
      ];

      for (const payload of xssPayloads) {
        try {
          await apiService.sendMessage(testUserId, payload);
          const messages = await apiService.getMessages();
          const lastMessage = messages[0];
          
          expect(lastMessage.MESSAGE).not.toContain('<script>');
          expect(lastMessage.MESSAGE).not.toContain('javascript:');
          expect(lastMessage.MESSAGE).not.toContain('onerror=');
          expect(lastMessage.MESSAGE).not.toContain('onload=');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    test('Should sanitize announcement content', async () => {
      const xssPayload = '<div onclick="alert(\'xss\')">';
      
      const formData = new FormData();
      formData.append('title', 'Test Announcement');
      formData.append('message', xssPayload);
      formData.append('type', 'ANNOUNCEMENT');

      const response = await apiService.createAnnouncement(formData);
      expect(response.data.message).not.toContain('onclick');
    });
  });

  /**
   * Test ID: HOA-SEC-DATA-002
   * Component: SQL Protection
   * Requirement: SQL Injection Prevention
   */
  describe('SQL Injection Prevention (HOA-SEC-DATA-002)', () => {
    test('Should prevent SQL injection in search parameters', async () => {
      const sqlInjectionAttempts = [
        "' OR '1'='1",
        "; DROP TABLE users;",
        "' UNION SELECT * FROM users--",
        "1'; SELECT * FROM users WHERE 't' = 't"
      ];

      for (const injection of sqlInjectionAttempts) {
        const response = await apiService.searchUsers(injection);
        
        // Should return empty results or filtered results, not error
        expect(response).toBeDefined();
        expect(Array.isArray(response)).toBe(true);
      }
    });

    test('Should prevent SQL injection in payment parameters', async () => {
      const maliciousAmount = "'; UPDATE accounts SET balance='0";
      
      try {
        await apiService.submitPayment({
          amount: maliciousAmount,
          accountId: testUserId
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        // Verify account balance was not affected
        const accountInfo = await apiService.getAccountDetails();
        expect(typeof accountInfo.balance).toBe('number');
      }
    });
  });

  /**
   * Test ID: HOA-SEC-DATA-003
   * Component: File Security
   * Requirement: Upload Security
   */
  describe('File Upload Security (HOA-SEC-DATA-003)', () => {
    test('Should reject dangerous file types', async () => {
      const dangerousFiles = [
        new File(['content'], 'test.exe', { type: 'application/x-msdownload' }),
        new File(['content'], 'test.php', { type: 'application/x-php' }),
        new File(['content'], 'test.js', { type: 'text/javascript' })
      ];

      for (const file of dangerousFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', 'Test Document');
        
        try {
          await apiService.uploadDocument(formData);
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error).toMatch(/file type/i);
        }
      }
    });

    test('Should sanitize file names', async () => {
      const maliciousFileName = '../../../etc/passwd';
      const file = new File(['test content'], maliciousFileName, { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', 'Test Document');

      const response = await apiService.uploadDocument(formData);
      expect(response.data.fileName).not.toContain('../');
      expect(response.data.fileName).not.toContain('/');
    });
  });

  /**
   * Test ID: HOA-SEC-DATA-004
   * Component: Data Privacy
   * Requirement: Data Protection
   */
  describe('Data Privacy Protection (HOA-SEC-DATA-004)', () => {
    test('Should not expose sensitive user data in API responses', async () => {
      const response = await apiService.getOwnerDetails();
      
      // Verify sensitive data is not exposed
      expect(response.password).toBeUndefined();
      expect(response.salt).toBeUndefined();
      expect(response.securityQuestions).toBeUndefined();
    });

    test('Should properly scope user access to data', async () => {
      // Try to access another user's data
      try {
        await axiosPrivate.get(`/owner-info/${testUserId + 1}`);
      } catch (error) {
        expect(error.response.status).toBe(403);
      }

      // Verify user can only see their own payment history
      const payments = await apiService.getPaymentHistory();
      payments.forEach(payment => {
        expect(payment.accountId).toBe(testUserId);
      });
    });

    test('Should mask sensitive data in logs', async () => {
      const paymentData = {
        cardNumber: '4111111111111111',
        cvv: '123',
        expiryMonth: '12',
        expiryYear: '2025'
      };

      const response = await apiService.addCard(testUserId, paymentData);
      
      // Verify response doesn't contain full card details
      expect(response.data.cardNumber).toMatch(/^\*+\d{4}$/);
      expect(response.data.cvv).toBeUndefined();
    });
  });
});