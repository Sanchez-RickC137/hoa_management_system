// __mocks__/axios.js
const mockAxios = jest.createMockFromModule('axios');

// Create method implementation
mockAxios.create = jest.fn(() => ({
  defaults: { 
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  interceptors: {
    request: { 
      use: jest.fn((successCb) => {
        successCb({ headers: {} });
        return mockAxios;
      }),
      eject: jest.fn() 
    },
    response: { 
      use: jest.fn((successCb, errorCb) => {
        successCb({ data: {} });
        return mockAxios;
      }), 
      eject: jest.fn() 
    }
  },
  get: jest.fn().mockImplementation((url) => {
    if (url === '/verify-token') {
      return Promise.resolve({ status: 200, data: { valid: true } });
    }
    return Promise.resolve({ status: 200, data: {} });
  }),
  post: jest.fn().mockImplementation((url, data) => {
    if (url === '/login') {
      return Promise.resolve({ 
        status: 200, 
        data: {
          token: 'mock-token',
          user: {
            id: 1,
            email: 'test@example.com'
          }
        }
      });
    }
    return Promise.resolve({ status: 200, data: {} });
  }),
  put: jest.fn(() => Promise.resolve({ status: 200, data: {} })),
  delete: jest.fn(() => Promise.resolve({ status: 200, data: {} }))
}));

module.exports = mockAxios;