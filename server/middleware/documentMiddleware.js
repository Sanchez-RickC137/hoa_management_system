const pool = require('../db');
const multer = require('multer');

// Configure allowed file types
const ALLOWED_FILE_TYPES = {
	// Microsoft Office formats
	'application/msword': true, // .doc
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true, // .docx
	'application/vnd.ms-excel': true, // .xls
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true, // .xlsx
	'application/vnd.ms-powerpoint': true, // .ppt
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': true, // .pptx
	
	// PDF format
	'application/pdf': true,
	
	// Text files
	'text/plain': true,
	
	// Common alternative MIME types
	'application/vnd.ms-word': true,
	'application/excel': true,
	'application/mspowerpoint': true
  };
  
  // Configure multer storage
  const storage = multer.memoryStorage();
  
  // Create multer middleware instance with custom file filter
  const upload = multer({
	storage: storage,
	limits: {
	  fileSize: 25 * 1024 * 1024, // 25MB limit
	},
	fileFilter: (req, file, cb) => {
	  console.log('Processing file:', file);
	  if (ALLOWED_FILE_TYPES[file.mimetype]) {
		cb(null, true);
	  } else {
		cb(new Error('Invalid file type. Allowed types: Microsoft Office documents, PDF, and text files.'));
	  }
	}
  });
  
  // Wrap multer middleware to handle errors
  const handleDocumentUpload = (req, res, next) => {
	const uploadMiddleware = upload.single('file');
	
	uploadMiddleware(req, res, (err) => {
	  console.log('Document upload middleware processing');
	  console.log('Request file:', req.file);
	  console.log('Request body:', req.body);
	  
	  if (err instanceof multer.MulterError) {
		console.error('Multer error:', err);
		if (err.code === 'LIMIT_FILE_SIZE') {
		  return res.status(400).json({ error: 'File size cannot exceed 25MB' });
		}
		return res.status(400).json({ error: `Upload error: ${err.message}` });
	  } else if (err) {
		console.error('Other upload error:', err);
		return res.status(400).json({ error: err.message });
	  }
	  next();
	});
  };
  
  const validateDocument = (req, res, next) => {
	const { title, description } = req.body;
	
	if (!title || !description) {
	  return res.status(400).json({ error: 'Title and description are required' });
	}
  
	if (!req.file) {
	  return res.status(400).json({ error: 'File is required' });
	}
  
	next();
  };
  
  module.exports = {
	handleDocumentUpload,
	validateDocument
  };