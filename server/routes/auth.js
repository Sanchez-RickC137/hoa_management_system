// const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const router = express.Router();
// const pool = require('../db');

// router.post('/register', async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const [result] = await pool.query(
//       'INSERT INTO OWNER (FIRST_NAME, LAST_NAME, EMAIL, PASSWORD_HASH) VALUES (?, ?, ?, ?)',
//       [firstName, lastName, email, hashedPassword]
//     );
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error registering user' });
//   }
// });

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const [rows] = await pool.query('SELECT * FROM OWNER WHERE EMAIL = ?', [email]);
//     if (rows.length === 0) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     const user = rows[0];
//     const isValidPassword = await bcrypt.compare(password, user.PASSWORD_HASH);
//     if (!isValidPassword) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     const token = jwt.sign({ id: user.OWNER_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ message: 'Error logging in' });
//   }
// });

// module.exports = router;