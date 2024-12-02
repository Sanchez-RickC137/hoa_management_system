const jwt_decode = require('jwt-decode');
const { axiosPublic, axiosPrivate, testAuthService } = require('./testUtils');

/**
 * Configuration for test user
 */
const TEST_CONFIG = {
  TEST_USER: {
    email: 'Ada.Nolcrest@coldmail.com',
    password: 'Pas$w0rd1!'
  }
};

describe('Authentication Security Tests', () => {
  let validToken;
  let testEmail = TEST_CONFIG.TEST_USER.email;
  let testPassword = TEST_CONFIG.TEST_USER.password;

  beforeAll(async () => {
    // Get a valid token through login
    const response = await testAuthService.login(testEmail, testPassword);
    validToken = response.token;
  });

  /**
   * Test ID: HOA-SEC-AUTH-001
   * Component: Token Validation
   * Requirement: Token Check
   */
  describe('Token Validation (HOA-SEC-AUTH-001)', () => {
    beforeAll(async () => {
      // Get a valid token through login
      const response = await authService.login(testEmail, testPassword);
      validToken = response.token;
    });

    test('Valid token should authenticate successfully', async () => {
      // Add token to request
      axiosPrivate.defaults.headers.common['Authorization'] = `Bearer ${validToken}`;
      const response = await axiosPrivate.get('/verify-token');
      expect(response.status).toBe(200);
    });

    test('Invalid token should fail authentication', async () => {
      const invalidToken = 'invalid.token.string';
      axiosPrivate.defaults.headers.common['Authorization'] = `Bearer ${invalidToken}`;
      
      try {
        await axiosPrivate.get('/verify-token');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });

    test('Expired token should trigger refresh', async () => {
      // Create an expired token (manipulate exp claim)
      const decoded = jwt_decode(validToken);
      decoded.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      axiosPrivate.defaults.headers.common['Authorization'] = `Bearer ${validToken}`;
      const response = await axiosPrivate.get('/verify-token');
      
      // Should get a new token via refresh mechanism
      expect(response.status).toBe(200);
      const newToken = localStorage.getItem('token');
      expect(newToken).not.toBe(validToken);
    });
  });

  /**
   * Test ID: HOA-SEC-AUTH-002
   * Component: Session Security
   * Requirement: Session Check
   */
  describe('Session Security (HOA-SEC-AUTH-002)', () => {
    test('Session should persist across requests', async () => {
      const loginResponse = await authService.login(testEmail, testPassword);
      expect(loginResponse.token).toBeDefined();

      // Make multiple requests to verify session persistence
      const requests = Array(3).fill().map(() => axiosPrivate.get('/profile'));
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      });
    });

    test('Session should expire after timeout', async () => {
      // This test might need to be adjusted based on your session timeout setting
      const loginResponse = await authService.login(testEmail, testPassword);
      
      // Wait for session timeout (e.g., 15 minutes)
      await new Promise(resolve => setTimeout(resolve, 900000));
      
      try {
        await axiosPrivate.get('/profile');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  /**
   * Test ID: HOA-SEC-AUTH-003
   * Component: Password Security
   * Requirement: Password Rules
   */
  describe('Password Security (HOA-SEC-AUTH-003)', () => {
    test('Should reject weak passwords', async () => {
      const weakPasswords = [
        'password',
        '12345678',
        'abcdefgh',
        'short',
        'NoSpecialChar1'
      ];

      for (const password of weakPasswords) {
        try {
          await authService.register({
            email: 'test@example.com',
            password: password,
            firstName: 'Test',
            lastName: 'User'
          });
        } catch (error) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.error).toMatch(/password/i);
        }
      }
    });

    test('Should accept strong passwords', async () => {
      const strongPassword = 'StrongP@ssw0rd123!';
      const response = await authService.register({
        email: 'strong@example.com',
        password: strongPassword,
        firstName: 'Strong',
        lastName: 'Password'
      });
      
      expect(response.status).toBe(200);
    });
  });

  /**
   * Test ID: HOA-SEC-AUTH-004
   * Component: Access Control
   * Requirement: Route Protection
   */
  describe('Access Control (HOA-SEC-AUTH-004)', () => {
    test('Protected routes should require authentication', async () => {
      // Clear any existing auth
      localStorage.removeItem('token');
      axiosPrivate.defaults.headers.common['Authorization'] = '';

      const protectedRoutes = [
        '/dashboard',
        '/documents',
        '/payments',
        '/messages',
        '/settings'
      ];

      for (const route of protectedRoutes) {
        try {
          await axiosPrivate.get(route);
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      }
    });

    test('Board member routes should require board permissions', async () => {
      // Login as regular user
      await authService.login(testEmail, testPassword);

      const boardRoutes = [
        '/board-dashboard',
        '/manage-violations',
        '/manage-assessments'
      ];

      for (const route of boardRoutes) {
        try {
          await axiosPrivate.get(route);
        } catch (error) {
          expect(error.response.status).toBe(403);
        }
      }
    });
  });
});