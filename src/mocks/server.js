const { setupServer } = require('msw/node');
const { rest } = require('msw');

const handlers = [
  rest.post('/api/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'fake-token',
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid email or password' })
    );
  }),

  rest.get('/api/profile', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.includes('Bearer fake-token')) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        OWNER_ID: 1,
        EMAIL: 'test@example.com',
        FIRST_NAME: 'Test',
        LAST_NAME: 'User'
      })
    );
  })
];

const server = setupServer(...handlers);

module.exports = { server, rest };