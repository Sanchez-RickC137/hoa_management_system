
const pool = require('../db');
const multer = require('multer');

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer processing file:', file);
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Create multer middleware instance
const uploadMiddleware = upload.single('file');

// Wrap multer middleware to handle errors
const handleUpload = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    console.log('Upload middleware processing');
    console.log('Request file:', req.file);
    console.log('Request body:', req.body);
    
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Other upload error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Verify board member status
const verifyBoardMember = async (req, res, next) => {
  try {
    console.log('Verifying board member status for user:', req.userId);
    
    const [rows] = await pool.query(`
      SELECT bma.* 
      FROM BOARD_MEMBER_ADMIN bma
      JOIN OWNER_BOARD_MEMBER_MAP obm ON bma.MEMBER_ID = obm.BOARD_MEMBER_ID
      WHERE obm.OWNER_ID = ? AND 
            obm.START_DATE <= CURRENT_DATE AND 
            (obm.END_DATE IS NULL OR obm.END_DATE >= CURRENT_DATE)
    `, [req.userId]);

    console.log('Board member query result:', rows);

    if (rows.length === 0) {
      console.log('User is not a board member:', req.userId);
      return res.status(403).json({ error: 'Access denied. Board member privileges required.' });
    }
    
    req.boardMember = rows[0];
    console.log('Board member verified:', req.boardMember);
    next();
  } catch (error) {
    console.error('Error verifying board member status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Validate announcement input
const validateAnnouncement = (req, res, next) => {
  const { title, message, type } = req.body;
  
  if (!title || !message || !type) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  if (!['ANNOUNCEMENT', 'NEWS', 'EVENT'].includes(type)) {
    return res.status(400).json({ error: 'Invalid announcement type' });
  }

  if (type === 'EVENT' && !req.body.eventDate) {
    return res.status(400).json({ error: 'Event date is required for events' });
  }

  next();
};

module.exports = {
  handleUpload,
  verifyBoardMember,
  validateAnnouncement
};
