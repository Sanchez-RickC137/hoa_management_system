import { apiService } from '../services/apiService';
import { axiosPrivate } from '../services/axiosConfig';

/**
 * API Security Test Suite
 * 
 * Test ID: HOA-SEC-API-001 through HOA-SEC-API-004
 * Purpose: Verify API security mechanisms including request validation,
 *         response handling, error handling, and rate limiting.
 * 
 * Requirements Tested:
 * - Request Validation
 * - Response Security
 * - Error Handling
 * - Rate Limiting
 */

describe('API Security Tests', () => {
  let validToken;
  
  beforeAll(async () => {
    const response = await authService.login('test@example.com', 'Test123!@#');
    validToken = response.token;
    axiosPrivate.defaults.headers.common['Authorization'] = `Bearer ${validToken}`;
  });

  /**
   * Test ID: HOA-SEC-API-001
   * Component: Request Security
   * Requirement: Request Validation
   */
  describe('Request Validation (HOA-SEC-API-001)', () => {
    test('Should validate request body', async () => {
      const invalidPayloads = [
        { amount: 'not-a-number' },
        { date: 'invalid-date' },
        { email: 'not-an-email' }
      ];

      for (const payload of invalidPayloads) {
        try {
          await apiService.submitPayment(payload);
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error).toBeDefined();
        }
      }
    });

    test('Should prevent parameter pollution', async () => {
      const response = await axiosPrivate.get('/documents', {
        params: {
          type: ['malicious', 'multiple', 'values']
        }
      });
      
      // Should only use the first or last value, not all
      expect(response.config.params.type).toBeString();
    });
  });

  /**
   * Test ID: HOA-SEC-API-002
   * Component: Response Security
   * Requirement: Response Handling
   */
  describe('Response Security (HOA-SEC-API-002)', () => {
    test('Should set secure headers', async () => {
      const response = await axiosPrivate.get('/profile');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    test('Should not expose internal errors', async () => {
      try {
        await axiosPrivate.get('/invalid-endpoint');
      } catch (error) {
        expect(error.response.data).not.toContain('Error:');
        expect(error.response.data).not.toContain('stack');
        expect(error.response.data.error).toMatch(/generic error message/i);
      }
    });
  });

  /**
   * Test ID: HOA-SEC-API-003
   * Component: Error Security
   * Requirement: Error Handling
   */
  describe('Error Handling (HOA-SEC-API-003)', () => {
    test('Should handle validation errors securely', async () => {
      try {
        await apiService.createAnnouncement({
          title: 'A'.repeat(1000), // Too long
          type: 'INVALID_TYPE'
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBeDefined();
        expect(error.response.data.stack).toBeUndefined();
      }
    });

    test('Should handle database errors securely', async () => {
      try {
        // Attempt to create duplicate unique record
        await apiService.createSurvey({
          message: 'Test Survey',
          answers: ['Yes', 'No'],
          endDate: new Date()
        });
        
        await apiService.createSurvey({
          message: 'Test Survey', // Duplicate
          answers: ['Yes', 'No'],
          endDate: new Date()
        });
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).not.toContain('SQL');
      }
    });
  });

  /**
   * Test ID: HOA-SEC-API-004
   * Component: Rate Limiting
   * Requirement: Rate Protection
   */
  describe('Rate Limiting (HOA-SEC-API-004)', () => {
    test('Should enforce rate limits', async () => {
      const requests = Array(100).fill().map(() => 
        axiosPrivate.get('/profile')
      );
      
      try {
        await Promise.all(requests);
      } catch (error) {
        expect(error.response.status).toBe(429);
        expect(error.response.headers['retry-after']).toBeDefined();
      }
    });

    test('Should track rate limits by IP', async () => {
      // Make requests with different IPs
      const response1 = await axiosPrivate.get('/profile', {
        headers: { 'X-Forwarded-For': '1.1.1.1' }
      });
      
      const response2 = await axiosPrivate.get('/profile', {
        headers: { 'X-Forwarded-For': '2.2.2.2' }
      });
      
      expect(response1.headers['x-ratelimit-remaining'])
        .not.toBe(response2.headers['x-ratelimit-remaining']);
    });

    test('Should reset rate limits after window', async () => {
      // Make requests until limit
      const requests = Array(50).fill().map(() => 
        axiosPrivate.get('/profile')
      );
      
      await Promise.all(requests);
      
      // Wait for rate limit window to reset
      await new Promise(resolve => setTimeout(resolve, 60000));
      
      // Should be able to make requests again
      const response = await axiosPrivate.get('/profile');
      expect(response.status).toBe(200);
    });
  });
});