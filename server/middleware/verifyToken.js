const verifyToken = (req, res, next) => {
  console.log('Verifying token...');
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  
  if (!authHeader) {
    console.log('No authorization header found');
    return res.status(403).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    console.log('Token is empty or undefined');
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.userId = decoded.id;
    console.log('Set userId:', req.userId);
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Failed to authenticate token' });
  }
};