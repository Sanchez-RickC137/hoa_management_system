const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const saltRounds = 10;
const pool = require('../db');
const verifyToken = require('../middleware/auth');  
const { handleDocumentUpload, validateDocument } = require('../middleware/documentMiddleware');
const { handleUpload, verifyBoardMember, validateAnnouncement } = require('../middleware/announcementMiddleware');
const { passwordResetLimiter } = require('../middleware/rateLimiter');
const { sendEmail } = require('../utils/emailUtils');
const { generatePDFReceipt } = require('../utils/pdfUtils');
const { validateAmount, formatCurrency } = require('../utils/currencyUtils');
const { processSurveyResults } = require('../utils/surveyUtils');

// Authentication routes
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM OWNER WHERE EMAIL = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.PASSWORD_HASH);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get board member details
    const [boardMemberRows] = await pool.query(`
      SELECT bma.* 
      FROM BOARD_MEMBER_ADMIN bma
      JOIN OWNER_BOARD_MEMBER_MAP obm ON bma.MEMBER_ID = obm.BOARD_MEMBER_ID
      WHERE obm.OWNER_ID = ? AND 
            obm.START_DATE <= CURRENT_DATE AND 
            (obm.END_DATE IS NULL OR obm.END_DATE > CURRENT_DATE)
    `, [user.OWNER_ID]);

    console.log('Board member details from DB:', boardMemberRows[0]); // Debug log

    const token = jwt.sign({ id: user.OWNER_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const userResponse = {
      id: user.OWNER_ID,
      email: user.EMAIL,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      role: boardMemberRows.length > 0 ? 'board_member' : 'resident',
      boardMemberDetails: boardMemberRows[0] || null,
      isBoardMember: boardMemberRows.length > 0
    };

    res.json({
      token,
      user: userResponse,
      isTemporaryPassword: user.IS_TEMPORARY_PASSWORD === 1
    });
  } catch (error) {
    console.error('Server: Login error', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify the expired token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true
    });

    // Generate new token
    const newToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});


// User routes
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Get user basic info
    const [userRows] = await pool.query(
      'SELECT OWNER_ID, FIRST_NAME, LAST_NAME, EMAIL FROM OWNER WHERE OWNER_ID = ?', 
      [req.userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get board member details if they exist
    const [boardMemberResult] = await pool.query(`
      SELECT bma.* 
      FROM BOARD_MEMBER_ADMIN bma
      JOIN OWNER_BOARD_MEMBER_MAP obm ON bma.MEMBER_ID = obm.BOARD_MEMBER_ID
      WHERE obm.OWNER_ID = ?
        AND obm.START_DATE <= CURRENT_DATE
        AND (obm.END_DATE IS NULL OR obm.END_DATE > CURRENT_DATE)
    `, [req.userId]);

    const user = {
      ...userRows[0],
      role: boardMemberResult.length > 0 ? 'board_member' : 'resident',
      boardMemberDetails: boardMemberResult[0] || null,
      isBoardMember: boardMemberResult.length > 0
    };

    res.json(user);
  } catch (error) {
    console.error('Server: Profile fetch error', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Dashboard Info
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    // Get account info
    const [accountInfo] = await pool.query(`
      SELECT a.ACCOUNT_ID, a.BALANCE, p.UNIT, p.STREET, p.CITY, p.STATE, p.ZIP_CODE
      FROM ACCOUNT a
      JOIN PROPERTY p ON a.PROPERTY_ID = p.PROP_ID
      WHERE a.OWNER_ID = ?
    `, [req.userId]);

    // Get recent charges
    const [recentCharges] = await pool.query(`
      SELECT 
        ac.CHARGE_ID,
        COALESCE(vt.VIOLATION_DESCRIPTION, at.ASSESSMENT_DESCRIPTION, 'Charge') as DESCRIPTION,
        COALESCE(vt.VIOLATION_RATE, ar.AMOUNT) as AMOUNT,
        COALESCE(ac.PAYMENT_DUE_DATE, ac.ASSESS_DATE) as DUE_DATE
      FROM ACCOUNT_CHARGE ac
      LEFT JOIN VIOLATION_TYPE vt ON ac.VIOLATION_TYPE_ID = vt.TYPE_ID
      LEFT JOIN ASSESSMENT_TYPE at ON ac.ASSESS_TYPE_ID = at.TYPE_ID
      LEFT JOIN ASSESSMENT_RATE ar ON ac.RATE_ID = ar.RATE_ID
      WHERE ac.ACCOUNT_ID = ?
      ORDER BY DUE_DATE DESC
      LIMIT 3
    `, [accountInfo[0]?.ACCOUNT_ID]);

    // Get recent updates
    const [recentUpdates] = await pool.query(`
      SELECT 
        'announcement' as type,
        TITLE as title,
        MESSAGE as content,
        CREATED as date
      FROM ANNOUNCEMENT_NEWS
      ORDER BY CREATED DESC
      LIMIT 5
    `);

    res.json({
      accountInfo: accountInfo[0] || null,
      recentCharges: recentCharges || [],
      recentUpdates: recentUpdates || []
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'An error occurred while fetching dashboard data' });
  }
});

// Get account info
router.get('/account-details', verifyToken, async (req, res) => {
  console.log('Server: Account details request received');
  try {
    const userId = req.userId;
    
    const [accountInfo] = await pool.query(`
      SELECT a.ACCOUNT_ID as accountNumber, 
             CONCAT(p.UNIT, ' ', p.STREET, ', ', p.CITY, ', ', p.STATE, ' ', p.ZIP_CODE) as address, 
             a.BALANCE as balance
      FROM ACCOUNT a
      JOIN PROPERTY p ON a.PROPERTY_ID = p.PROP_ID
      WHERE a.OWNER_ID = ?
    `, [userId]);

    if (accountInfo.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const [lastPayment] = await pool.query(`
      SELECT PAYMENT_AMOUNT as amount, DATE_OF_PAYMENT as date
      FROM PAYMENT
      WHERE ACCOUNT_ID = ?
      ORDER BY DATE_OF_PAYMENT DESC
      LIMIT 1
    `, [accountInfo[0].accountNumber]);

    const [paymentHistory] = await pool.query(`
      (SELECT 
          'charge' as type, 
          CHARGE_ID as chargeId,
          NULL as paymentId,  -- Return NULL for paymentId
          COALESCE(ac.ASSESS_DATE, ac.VIOLATION_DATE) as date, 
          CASE 
              WHEN ac.VIOLATION_TYPE_ID IS NOT NULL THEN vt.VIOLATION_DESCRIPTION
              ELSE COALESCE(at.ASSESSMENT_DESCRIPTION, 'Charge')
          END as description,
          COALESCE(vt.VIOLATION_RATE, ar.AMOUNT) as amount,
          0 as balance
      FROM ACCOUNT_CHARGE ac
      LEFT JOIN VIOLATION_TYPE vt ON ac.VIOLATION_TYPE_ID = vt.TYPE_ID
      LEFT JOIN ASSESSMENT_TYPE at ON ac.ASSESS_TYPE_ID = at.TYPE_ID
      LEFT JOIN ASSESSMENT_RATE ar ON ac.RATE_ID = ar.RATE_ID
      WHERE ac.ACCOUNT_ID = ?)
  
      UNION ALL
  
      (SELECT 
          'payment' as type, 
          NULL as chargeId,  -- Return NULL for chargeId
          PAYMENT_ID as paymentId,
          DATE_OF_PAYMENT as date, 
          PAYMENT_DESCRIPTION as description, 
          PAYMENT_AMOUNT as amount,
          0 as balance
      FROM PAYMENT
      WHERE ACCOUNT_ID = ?)
  
      ORDER BY date DESC
      LIMIT 50
  `, [accountInfo[0].accountNumber, accountInfo[0].accountNumber]);

    let runningBalance = accountInfo[0].balance;
    paymentHistory.forEach(item => {
      if (item.type === 'charge') {
        runningBalance -= item.amount;
      } else {
        runningBalance += item.amount;
      }
      item.balance = runningBalance;
    });

    res.json({
      accountInfo: {
        ...accountInfo[0],
        lastPaymentAmount: lastPayment[0]?.amount || 0,
        lastPaymentDate: lastPayment[0]?.date || null,
      },
      paymentHistory: paymentHistory.reverse()
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ error: 'An error occurred while fetching account details' });
  }
});

// Get Cards Route
router.get('/cards/:accountId', verifyToken, async (req, res) => {
  try {
    const accountId = req.params.accountId;
    console.log('Fetching cards for account:', accountId);

    const [cards] = await pool.query(
      'SELECT CARD_ID, CARD_TYPE, CARD_NUMBER_LAST_4, EXPIRY_MONTH, EXPIRY_YEAR, IS_DEFAULT FROM CREDIT_CARDS WHERE ACCOUNT_ID = ? AND IS_ACTIVE = 1',
      [accountId]
    );

    console.log('Fetched cards:', cards);
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'An error occurred while fetching cards' });
  }
});

// Add Cards Route
router.post('/cards/:accountId', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { cardNumber, expiryMonth, expiryYear, cardType, nickname } = req.body;
    const accountId = req.params.accountId;
    
    const last4 = cardNumber.slice(-4);
    
    // Create a hash of the card number
    const cardNumberHash = crypto.createHash('sha256').update(cardNumber).digest('hex');

    // Check if card exists for this account
    const [existingCard] = await connection.query(
      'SELECT CARD_ID, IS_ACTIVE FROM CREDIT_CARDS WHERE ACCOUNT_ID = ? AND CARD_NUMBER_HASH = ?',
      [accountId, cardNumberHash]
    );

    if (existingCard.length > 0) {
      // Card exists - check if it's inactive
      if (!existingCard[0].IS_ACTIVE) {
        // Update and reactivate the existing card
        await connection.query(
          `UPDATE CREDIT_CARDS 
           SET EXPIRY_MONTH = ?, 
               EXPIRY_YEAR = ?, 
               CARD_TYPE = ?,
               CARD_NICKNAME = ?,
               IS_ACTIVE = 1,
               UPDATED_AT = CURRENT_TIMESTAMP
           WHERE CARD_ID = ?`,
          [expiryMonth, expiryYear, cardType, nickname, existingCard[0].CARD_ID]
        );
        await connection.commit();
        res.json({ 
          message: 'Card reactivated successfully', 
          cardId: existingCard[0].CARD_ID 
        });
        return;
      } else {
        // Card is already active
        await connection.rollback();
        res.status(400).json({ 
          error: 'This card is already registered to this account' 
        });
        return;
      }
    }

    // Check if this is the first active card for the account
    const [existingCards] = await connection.query(
      'SELECT COUNT(*) as cardCount FROM CREDIT_CARDS WHERE ACCOUNT_ID = ? AND IS_ACTIVE = 1',
      [accountId]
    );
    const isDefault = existingCards[0].cardCount === 0 ? 1 : 0;

    // Insert the new card
    const [result] = await connection.query(
      `INSERT INTO CREDIT_CARDS (
        ACCOUNT_ID, 
        CARD_NUMBER_LAST_4, 
        CARD_NUMBER_HASH, 
        EXPIRY_MONTH, 
        EXPIRY_YEAR, 
        CARD_TYPE, 
        CARD_NICKNAME, 
        IS_DEFAULT
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [accountId, last4, cardNumberHash, expiryMonth, expiryYear, cardType, nickname, isDefault]
    );

    await connection.commit();
    res.status(201).json({ 
      message: 'Card added successfully', 
      cardId: result.insertId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding card:', error);
    res.status(500).json({ 
      error: 'An error occurred while adding the card' 
    });
  } finally {
    connection.release();
  }
});

// Set Default Card Route
router.put('/cards/:cardId/default', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const cardId = req.params.cardId;
    
    // Get the account ID for this card
    const [cardRows] = await connection.query(
      'SELECT ACCOUNT_ID FROM CREDIT_CARDS WHERE CARD_ID = ?',
      [cardId]
    );

    if (cardRows.length === 0) {
      throw new Error('Card not found');
    }

    const accountId = cardRows[0].ACCOUNT_ID;

    // Set all cards for this account to non-default
    await connection.query(
      'UPDATE CREDIT_CARDS SET IS_DEFAULT = FALSE WHERE ACCOUNT_ID = ?',
      [accountId]
    );

    // Set the specified card as default
    await connection.query(
      'UPDATE CREDIT_CARDS SET IS_DEFAULT = TRUE WHERE CARD_ID = ?',
      [cardId]
    );

    await connection.commit();
    res.json({ message: 'Default card updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating default card:', error);
    res.status(500).json({ error: 'An error occurred while updating the default card' });
  } finally {
    connection.release();
  }
});

// Remove Card Route
router.delete('/cards/:cardId', verifyToken, async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const query = "UPDATE CREDIT_CARDS SET IS_ACTIVE = 0, IS_DEFAULT = 0 WHERE CARD_ID = ?";
    await pool.query(query, [cardId]);
    res.json({ message: 'Card successfully removed' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'An error occurred while deleting the card' });
  }
});

// Make a Payment Route
router.post('/payments', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  const debug = {
    paymentCreated: false,
    emailSent: false,
    paymentId: null,
    receiptGenerated: false,
    error: null
  };

  try {
    console.log('Starting payment processing...');
    await connection.beginTransaction();
   
    const { amount, cardId, accountId, description } = req.body;
    const validatedAmount = validateAmount(amount);

    console.log('Payment details:', {
      amount: validatedAmount,
      cardId,
      accountId,
      description: description || 'Standard payment'
    });

    // Get card details for email
    const [cardDetails] = await connection.query(
      'SELECT CARD_TYPE, CARD_NUMBER_LAST_4 FROM CREDIT_CARDS WHERE CARD_ID = ?',
      [cardId]
    );

    console.log('Card details retrieved:', {
      cardType: cardDetails[0].CARD_TYPE,
      last4: cardDetails[0].CARD_NUMBER_LAST_4
    });

    // Insert the payment record
    const [paymentResult] = await connection.query(
      'INSERT INTO PAYMENT (ACCOUNT_ID, OWNER_ID, DATE_OF_PAYMENT, PAYMENT_AMOUNT, PAYMENT_DESCRIPTION, CARD_ID) VALUES (?, ?, NOW(), ?, ?, ?)',
      [accountId, req.userId, validatedAmount, description || 'Payment', cardId]
    );

    debug.paymentCreated = true;
    debug.paymentId = paymentResult.insertId;
    console.log('Payment record created:', paymentResult.insertId);

    // Update the account balance
    await connection.query(
      'UPDATE ACCOUNT SET BALANCE = BALANCE - ? WHERE ACCOUNT_ID = ?',
      [validatedAmount, accountId]
    );

    // Fetch the updated account balance
    const [balanceResult] = await connection.query(
      'SELECT BALANCE FROM ACCOUNT WHERE ACCOUNT_ID = ?',
      [accountId]
    );

    // Get the payment history
    const [paymentHistory] = await connection.query(`
      (SELECT 'charge' as type,
              COALESCE(ac.ASSESS_DATE, ac.VIOLATION_DATE) as date,
              CASE
                WHEN ac.VIOLATION_TYPE_ID IS NOT NULL THEN vt.VIOLATION_DESCRIPTION
                ELSE COALESCE(at.ASSESSMENT_DESCRIPTION, 'Charge')
              END as description,
              COALESCE(vt.VIOLATION_RATE, ar.AMOUNT) as amount,
              0 as balance
       FROM ACCOUNT_CHARGE ac
       LEFT JOIN VIOLATION_TYPE vt ON ac.VIOLATION_TYPE_ID = vt.TYPE_ID
       LEFT JOIN ASSESSMENT_TYPE at ON ac.ASSESS_TYPE_ID = at.TYPE_ID
       LEFT JOIN ASSESSMENT_RATE ar ON ac.RATE_ID = ar.RATE_ID
       WHERE ac.ACCOUNT_ID = ?)
      UNION ALL
      (SELECT 'payment' as type,
              DATE_OF_PAYMENT as date,
              PAYMENT_DESCRIPTION as description,
              PAYMENT_AMOUNT as amount,
              0 as balance
       FROM PAYMENT
       WHERE ACCOUNT_ID = ?)
      ORDER BY date DESC
      LIMIT 50
    `, [accountId, accountId]);

    // Calculate running balance
    let runningBalance = parseFloat(balanceResult[0].BALANCE);
    paymentHistory.forEach(item => {
      const itemAmount = parseFloat(item.amount);
      if (item.type === 'charge') {
        runningBalance += itemAmount;
      } else {
        runningBalance -= itemAmount;
      }
      item.balance = formatCurrency(runningBalance);
    });

    // Get owner with payment notification preferences
    const [ownerData] = await connection.query(
      `SELECT o.EMAIL, o.FIRST_NAME, o.LAST_NAME 
       FROM OWNER o 
       WHERE o.OWNER_ID = ? 
       AND o.NOTIFICATION_PREF_ID IN (1,4,5,8,9,12,13,16,17)`,
      [req.userId]
    );

    if (ownerData.length > 0) {
      console.log('Generating PDF receipt...');
      const receipt = await generatePDFReceipt({
        amount: validatedAmount,
        date: new Date(),
        cardType: cardDetails[0].CARD_TYPE,
        last4: cardDetails[0].CARD_NUMBER_LAST_4,
        confirmationNumber: paymentResult.insertId
      });
      
      debug.receiptGenerated = true;

      console.log('Sending confirmation email...');
      await sendEmail({
        to: ownerData[0].EMAIL,
        subject: 'Payment Confirmation - Summit Ridge HOA',
        template: 'payment',
        context: {
          recipientName: `${ownerData[0].FIRST_NAME} ${ownerData[0].LAST_NAME}`,
          amount: formatCurrency(validatedAmount),
          date: new Date(),
          paymentMethod: `${cardDetails[0].CARD_TYPE} ending in ${cardDetails[0].CARD_NUMBER_LAST_4}`,
          confirmationNumber: paymentResult.insertId,
          paymentHistoryUrl: `${process.env.FRONTEND_URL}/payments`
        },
        attachments: [{
          filename: 'receipt.pdf',
          content: receipt
        }]
      });

      debug.emailSent = true;
      console.log('Confirmation email sent successfully');
    }

    await connection.commit();
    console.log('Transaction committed successfully');

    res.status(200).json({
      message: 'Payment processed successfully',
      paymentId: paymentResult.insertId,
      newBalance: formatCurrency(balanceResult[0].BALANCE),
      paymentHistory: paymentHistory.reverse(),
      debug
    });

  } catch (error) {
    await connection.rollback();
    debug.error = error.message;
    console.error('Error processing payment:', {
      error: error.message,
      stack: error.stack,
      debug
    });
    res.status(500).json({ 
      error: 'An error occurred while processing the payment',
      details: error.message,
      debug
    });
  } finally {
    connection.release();
  }
});

// Payment Details Route (Deprecated)
router.get('/payments/details', verifyToken, async (req, res) => {
  try {
    const { date, amount } = req.query;
    console.log('Fetching payment details for date:', date, 'and amount:', amount);

    const [payment] = await pool.query(`
      SELECT 
        p.*,
        cc.CARD_TYPE, 
        cc.CARD_NUMBER_LAST_4
      FROM PAYMENT p
      LEFT JOIN CREDIT_CARDS cc ON p.CARD_ID = cc.CARD_ID
      WHERE DATE(p.DATE_OF_PAYMENT) = ?
        AND p.PAYMENT_AMOUNT = ?
    `, [date, parseFloat(amount)]);

    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      paymentId: payment[0].PAYMENT_ID,
      accountId: payment[0].ACCOUNT_ID,
      ownerId: payment[0].OWNER_ID,
      paymentDate: payment[0].DATE_OF_PAYMENT,
      amount: payment[0].PAYMENT_AMOUNT,
      description: payment[0].PAYMENT_DESCRIPTION,
      cardId: payment[0].CARD_ID,
      cardType: payment[0].CARD_TYPE,
      cardLastFour: payment[0].CARD_NUMBER_LAST_4
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'An error occurred while fetching payment details' });
  }
});

// Account Charge Route (Deprecated)
router.get('/charges/details', verifyToken, async (req, res) => {
  try {
    const { date, amount } = req.query;
    console.log('Fetching charge details for date:', date, 'and amount:', amount);

    const [charge] = await pool.query(`
      SELECT ac.*, 
             vt.VIOLATION_RATE, vt.VIOLATION_DESCRIPTION,
             at.ASSESSMENT_DESCRIPTION,
             ar.AMOUNT as ASSESSMENT_AMOUNT,
             o.FIRST_NAME, o.LAST_NAME
      FROM ACCOUNT_CHARGE ac
      LEFT JOIN VIOLATION_TYPE vt ON ac.VIOLATION_TYPE_ID = vt.TYPE_ID
      LEFT JOIN ASSESSMENT_TYPE at ON ac.ASSESS_TYPE_ID = at.TYPE_ID
      LEFT JOIN ASSESSMENT_RATE ar ON ac.RATE_ID = ar.RATE_ID
      LEFT JOIN BOARD_MEMBER_ADMIN bma ON ac.ISSUED_BY = bma.MEMBER_ID
      LEFT JOIN OWNER_BOARD_MEMBER_MAP obm ON bma.MEMBER_ID = obm.BOARD_MEMBER_ID
        AND ac.ASSESS_DATE BETWEEN obm.START_DATE AND IFNULL(obm.END_DATE, CURDATE())
      LEFT JOIN OWNER o ON obm.OWNER_ID = o.OWNER_ID
      WHERE DATE(ac.ASSESS_DATE) = ?
        AND CAST(COALESCE(vt.VIOLATION_RATE, ar.AMOUNT) AS DECIMAL(10,2)) = ?
    `, [date, parseFloat(amount)]);

    console.log('Matching charge:', charge);

    if (charge.length === 0) {
      console.log('Charge not found');
      return res.status(404).json({ error: 'Charge not found' });
    }

    console.log('Charge details found:', charge[0]);
    res.json({
      chargeId: charge[0].CHARGE_ID,
      accountId: charge[0].ACCOUNT_ID,
      chargeType: charge[0].CHARGE_TYPE,
      paymentDueDate: charge[0].PAYMENT_DUE_DATE,
      assessDate: charge[0].ASSESS_DATE,
      violationDate: charge[0].VIOLATION_DATE,
      violationDescription: charge[0].VIOLATION_DESCRIPTION,
      assessmentDescription: charge[0].ASSESSMENT_DESCRIPTION,
      amount: charge[0].VIOLATION_RATE || charge[0].ASSESSMENT_AMOUNT,
      issuedBy: charge[0].ISSUED_BY,
      issuerName: charge[0].FIRST_NAME && charge[0].LAST_NAME ? 
        `${charge[0].FIRST_NAME} ${charge[0].LAST_NAME}` : 'Unknown'
    });
  } catch (error) {
    console.error('Error fetching charge details:', error);
    res.status(500).json({ error: 'An error occurred while fetching charge details' });
  }
});

// Get payment details by ID
router.get('/payments/:paymentId', verifyToken, async (req, res) => {
  const { paymentId } = req.params;
  const ownerId = req.userId;

  try {
    // Get payment details with card info and account info
    const [payment] = await pool.query(
      `SELECT 
        p.*,
        cc.CARD_TYPE, 
        cc.CARD_NUMBER_LAST_4
      FROM PAYMENT p
      LEFT JOIN CREDIT_CARDS cc ON p.CARD_ID = cc.CARD_ID
      WHERE p.PAYMENT_ID = ?`,
      [paymentId]
    );

    if (payment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      paymentId: payment[0].PAYMENT_ID,
      accountId: payment[0].ACCOUNT_ID,
      ownerId: payment[0].OWNER_ID,
      paymentDate: payment[0].DATE_OF_PAYMENT,
      amount: payment[0].PAYMENT_AMOUNT,
      description: payment[0].PAYMENT_DESCRIPTION,
      cardId: payment[0].CARD_ID,
      cardType: payment[0].CARD_TYPE,
      cardLastFour: payment[0].CARD_NUMBER_LAST_4
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});


// Get charge details by ID
router.get('/charges/:chargeId', verifyToken, async (req, res) => {
  const { chargeId } = req.params;
  const ownerId = req.userId;

  try {
    // Get charge details with violation info if applicable
    const [charge] = await pool.query(`
      SELECT ac.*, 
             vt.VIOLATION_RATE, vt.VIOLATION_DESCRIPTION,
             at.ASSESSMENT_DESCRIPTION,
             ar.AMOUNT as ASSESSMENT_AMOUNT,
             o.FIRST_NAME, o.LAST_NAME
      FROM ACCOUNT_CHARGE ac
      LEFT JOIN VIOLATION_TYPE vt ON ac.VIOLATION_TYPE_ID = vt.TYPE_ID
      LEFT JOIN ASSESSMENT_TYPE at ON ac.ASSESS_TYPE_ID = at.TYPE_ID
      LEFT JOIN ASSESSMENT_RATE ar ON ac.RATE_ID = ar.RATE_ID
      LEFT JOIN BOARD_MEMBER_ADMIN bma ON ac.ISSUED_BY = bma.MEMBER_ID
      LEFT JOIN OWNER_BOARD_MEMBER_MAP obm ON bma.MEMBER_ID = obm.BOARD_MEMBER_ID
        AND ac.ASSESS_DATE BETWEEN obm.START_DATE AND IFNULL(obm.END_DATE, CURDATE())
      LEFT JOIN OWNER o ON obm.OWNER_ID = o.OWNER_ID
      WHERE ac.CHARGE_ID = ?
    `, [chargeId]);

    console.log('Matching charge:', charge);

    if (charge.length === 0) {
      console.log('Charge not found');
      return res.status(404).json({ error: 'Charge not found' });
    }

    console.log('Charge details found:', charge[0]);
    res.json({
      chargeId: charge[0].CHARGE_ID,
      accountId: charge[0].ACCOUNT_ID,
      chargeType: charge[0].CHARGE_TYPE,
      paymentDueDate: charge[0].PAYMENT_DUE_DATE,
      assessDate: charge[0].ASSESS_DATE,
      violationDate: charge[0].VIOLATION_DATE,
      violationDescription: charge[0].VIOLATION_DESCRIPTION,
      assessmentDescription: charge[0].ASSESSMENT_DESCRIPTION,
      amount: charge[0].VIOLATION_RATE || charge[0].ASSESSMENT_AMOUNT,
      issuedBy: charge[0].ISSUED_BY,
      issuerName: charge[0].FIRST_NAME && charge[0].LAST_NAME ? 
        `${charge[0].FIRST_NAME} ${charge[0].LAST_NAME}` : 'Unknown'
    });
  } catch (error) {
    console.error('Error fetching charge details:', error);
    res.status(500).json({ error: 'Failed to fetch charge details' });
  }
});

// Forgot Password Route
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  let connection;
  
  try {
    const { email } = req.body;
    connection = await pool.getConnection();
    
    await connection.beginTransaction();

    // Check if user exists
    const [users] = await connection.query(
      'SELECT OWNER_ID FROM OWNER WHERE EMAIL = ?',
      [email]
    );

    // Generate temporary password regardless of whether user exists (prevent timing attacks)
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    if (users.length > 0) {
      // Update user's password and mark it as temporary
      await connection.query(
        'UPDATE OWNER SET PASSWORD_HASH = ?, IS_TEMPORARY_PASSWORD = 1 WHERE EMAIL = ?',
        [hashedPassword, email]
      );

      // Send email using our email utility
      await sendEmail({
        to: email,
        subject: 'Summit Ridge HOA - Temporary Password',
        template: 'passwordReset',
        context: {
          tempPassword
        },
        bypassPreferences: true // Password resets should always send
      });
    }

    await connection.commit();

    // Always return the same response whether user exists or not
    res.json({
      success: true,
      message: 'If an account exists with this email, a temporary password has been sent.'
    });

  } catch (error) {
    console.error('Error in forgot password:', error);
    if (connection) {
      await connection.rollback();
    }
    
    res.json({
      success: true,
      message: 'If an account exists with this email, a temporary password has been sent.'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Temporary code checker for new registration
router.post('/verify-registration', async (req, res) => {
  try {
    const { accountId, ownerId, tempCode } = req.body;
    
    console.log('Received registration verification request:', {
      accountId,
      ownerId,
      tempCodeLength: tempCode ? tempCode.length : 0
    });

    // Input validation
    if (!accountId || !ownerId || !tempCode) {
      console.log('Missing required fields:', { accountId, ownerId, tempCodePresent: !!tempCode });
      return res.status(400).json({ valid: false, error: 'Missing required fields' });
    }

    // Query owner
    const [owner] = await pool.query(
      'SELECT OWNER_ID, PASSWORD_HASH, IS_TEMPORARY_PASSWORD FROM OWNER WHERE OWNER_ID = ?', 
      [ownerId]
    );
    
    console.log('Owner query result:', {
      found: owner.length > 0,
      isTemp: owner.length > 0 ? owner[0].IS_TEMPORARY_PASSWORD : null
    });

    if (owner.length === 0) {
      return res.status(400).json({ valid: false, error: 'Owner ID not found' });
    }

    // Verify account association
    const [account] = await pool.query(
      'SELECT ACCOUNT_ID FROM ACCOUNT WHERE ACCOUNT_ID = ? AND OWNER_ID = ?', 
      [accountId, ownerId]
    );
    
    console.log('Account query result:', { found: account.length > 0 });

    if (account.length === 0) {
      return res.status(400).json({ valid: false, error: 'Account not associated with this owner' });
    }

    // Check temporary password status
    if (!owner[0].IS_TEMPORARY_PASSWORD) {
      return res.status(400).json({ valid: false, error: 'Account is already registered' });
    }

    // Verify temporary code
    const isValidTempCode = await bcrypt.compare(tempCode, owner[0].PASSWORD_HASH);
    console.log('Temporary code verification:', { isValid: isValidTempCode });

    if (!isValidTempCode) {
      return res.status(400).json({ valid: false, error: 'Invalid temporary code' });
    }

    // Success
    res.json({ valid: true, accountId, ownerId });

  } catch (error) {
    console.error('Registration verification error:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'An error occurred during registration verification',
      details: error.message
    });
  }
});

// Account Registration Route
router.post('/register', async (req, res) => {
  try {
    const { accountId, ownerId, firstName, lastName, email, phoneNumber, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query(
      'UPDATE OWNER SET FIRST_NAME = ?, LAST_NAME = ?, EMAIL = ?, PHONE = ?, PASSWORD_HASH = ?, IS_TEMPORARY_PASSWORD = FALSE, VOTING_RIGHTS = 1 WHERE OWNER_ID = ?',
      [firstName, lastName, email, phoneNumber, hashedPassword, ownerId]
    );

    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'An error occurred during registration' });
  }
});

// Password Update Route
router.post('/change-password', verifyToken, async (req, res) => {
  // console.log('Route handler:', req.body);
  try {
    const { userId, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await pool.query(
      'UPDATE OWNER SET PASSWORD_HASH = ?, IS_TEMPORARY_PASSWORD = FALSE WHERE OWNER_ID = ?',
      [hashedPassword, userId]
    );
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, error: 'An error occurred while changing the password' });
  }
});

// User Messages Route
router.get('/messages', verifyToken, async (req, res) => {
  try {
    const [messages] = await pool.query(`
      SELECT 
        m.*,
        CASE 
          WHEN m.SENDER_ID = 999999999 THEN 'System'
          ELSE CONCAT(s.FIRST_NAME, ' ', s.LAST_NAME)
        END as SENDER_NAME,
        CONCAT(r.FIRST_NAME, ' ', r.LAST_NAME) as RECEIVER_NAME,
        omm.IS_READ
      FROM MESSAGE m
      LEFT JOIN OWNER s ON m.SENDER_ID = s.OWNER_ID
      LEFT JOIN OWNER r ON m.RECEIVER_ID = r.OWNER_ID
      JOIN OWNER_MESSAGE_MAP omm ON m.MESSAGE_ID = omm.MESSAGE_ID
      WHERE omm.OWNER_ID = ?
      ORDER BY m.CREATED DESC
    `, [req.userId]);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'An error occurred while fetching messages' });
  }
});

// New Message Route
router.post('/messages', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    console.log('Starting message creation process...');
    await connection.beginTransaction();
    const { receiverId, content, parentMessageId } = req.body;

    console.log('Message details:', { receiverId, parentMessageId, userId: req.userId });

    // Insert the message
    const [result] = await connection.query(`
      INSERT INTO MESSAGE (SENDER_ID, RECEIVER_ID, MESSAGE, CREATED, PARENT_MESSAGE_ID)
      VALUES (?, ?, ?, NOW(), ?)
    `, [req.userId, receiverId, content, parentMessageId]);

    console.log('Message inserted with ID:', result.insertId);

    // Create message mappings
    if (req.userId != receiverId) {
      console.log('Creating two-way message mapping...');
      await connection.query(`
        INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID)
        VALUES (?, ?), (?, ?)
      `, [req.userId, result.insertId, receiverId, result.insertId]);
    } else {
      console.log('Creating self-message mapping...');
      await connection.query(`
        INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID)
        VALUES (?, ?)
      `, [req.userId, result.insertId]);
    }

    // Get sender and recipient details
    console.log('Fetching sender and recipient details...');
    const [[sender], [recipient]] = await Promise.all([
      connection.query(`
        SELECT FIRST_NAME, LAST_NAME, EMAIL
        FROM OWNER
        WHERE OWNER_ID = ?
      `, [req.userId]),
      connection.query(`
        SELECT o.EMAIL, np.EMAIL_ENABLED, np.MESSAGES_ENABLED
        FROM OWNER o
        JOIN NOTIFICATION_PREFERENCES np ON o.NOTIFICATION_PREF_ID = np.PREF_ID
        WHERE o.OWNER_ID = ?
      `, [receiverId])
    ]);

    console.log('Sender details:', sender);
    console.log('Recipient details:', recipient);

    // Check email conditions
    const shouldSendEmail = recipient && 
                          recipient[0].EMAIL_ENABLED && 
                          recipient[0].MESSAGES_ENABLED && 
                          req.userId != 999999999;

    console.log('Email conditions:', {
      hasRecipient: !!recipient,
      emailEnabled: recipient[0].EMAIL_ENABLED,
      messagesEnabled: recipient[0].MESSAGES_ENABLED,
      notSystemMessage: req.userId != 999999999,
      shouldSendEmail
    });

    // Send email notification if enabled
    if (shouldSendEmail) {
      try {
        console.log('Preparing to send email notification...');
        
        // Verify SENDGRID_API_KEY is set
        console.log('SendGrid API Key present:', !!process.env.SENDGRID_API_KEY);

        const emailData = {
          to: recipient[0].EMAIL,
          subject: `New Message from ${sender[0].FIRST_NAME} ${sender[0].LAST_NAME}`,
          template: 'message',
          context: {
            senderName: `${sender[0].FIRST_NAME} ${sender[0].LAST_NAME}`,
            message: content,
            messageUrl: `${process.env.FRONTEND_URL}/messages`,
            preferencesUrl: `${process.env.FRONTEND_URL}/owner-info`
          }
        };

        console.log('Email data prepared:', {
          to: emailData.to,
          subject: emailData.subject,
          template: emailData.template,
          hasContext: !!emailData.context
        });

        await sendEmail(emailData);
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Error sending email:', {
          error: emailError.message,
          response: emailError.response?.body,
          stack: emailError.stack
        });
        // Continue with transaction even if email fails
      }
    } else {
      console.log('Skipping email notification - conditions not met');
    }

    await connection.commit();
    console.log('Transaction committed successfully');
    res.status(201).json({ message: 'Message sent successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error in message route:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'An error occurred while sending the message' });
  } finally {
    connection.release();
  }
});

// Delete Message by User Route
router.delete('/messages/:id', verifyToken, async (req, res) => {
  try {
    await pool.query(`
      DELETE FROM OWNER_MESSAGE_MAP
      WHERE OWNER_ID = ? AND MESSAGE_ID = ?
    `, [req.userId, req.params.id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the message' });
  }
});

// Message Recipient Route
router.get('/users', verifyToken, async (req, res) => {
  const { search } = req.query;
  try {
    const [users] = await pool.query(`
      SELECT o.OWNER_ID, o.FIRST_NAME, o.LAST_NAME, p.UNIT, p.STREET, p.CITY, p.STATE, p.ZIP_CODE, bma.MEMBER_ROLE
      FROM OWNER o
      LEFT JOIN PROPERTY_OWNER_MAP pom ON o.OWNER_ID = pom.OWNER_ID
      LEFT JOIN PROPERTY p ON pom.PROPERTY_ID = p.PROP_ID
      LEFT JOIN OWNER_BOARD_MEMBER_MAP obm ON o.OWNER_ID = obm.OWNER_ID
      LEFT JOIN BOARD_MEMBER_ADMIN bma ON obm.BOARD_MEMBER_ID = bma.MEMBER_ID
      WHERE o.FIRST_NAME LIKE ? OR o.LAST_NAME LIKE ?
      LIMIT 10
    `, [`%${search}%`, `%${search}%`]);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

// Create Message Threading
router.get('/messages/thread/:messageId', verifyToken, async (req, res) => {
  try {
    const [thread] = await pool.query(`
      WITH RECURSIVE MessageThread AS (
        -- First, get the root message of this thread
        SELECT m.*,
          CASE 
            WHEN m.SENDER_ID = 999999999 THEN 'System'
            ELSE CONCAT(s.FIRST_NAME, ' ', s.LAST_NAME)
          END as SENDER_NAME,
          CONCAT(r.FIRST_NAME, ' ', r.LAST_NAME) as RECEIVER_NAME,
          omm.IS_READ
        FROM (
          WITH RECURSIVE RootFinder AS (
            SELECT *, MESSAGE_ID as ROOT_ID
            FROM MESSAGE 
            WHERE MESSAGE_ID = ?
            
            UNION ALL
            
            SELECT m.*, rf.ROOT_ID
            FROM MESSAGE m
            JOIN RootFinder rf ON m.MESSAGE_ID = rf.PARENT_MESSAGE_ID
          )
          SELECT * FROM RootFinder
          ORDER BY CREATED ASC
          LIMIT 1
        ) root_message
        JOIN MESSAGE m ON m.MESSAGE_ID = root_message.MESSAGE_ID
        LEFT JOIN OWNER s ON m.SENDER_ID = s.OWNER_ID
        LEFT JOIN OWNER r ON m.RECEIVER_ID = r.OWNER_ID
        JOIN OWNER_MESSAGE_MAP omm ON m.MESSAGE_ID = omm.MESSAGE_ID AND omm.OWNER_ID = ?

        UNION ALL

        SELECT m.*,
          CASE 
            WHEN m.SENDER_ID = 999999999 THEN 'System'
            ELSE CONCAT(s.FIRST_NAME, ' ', s.LAST_NAME)
          END as SENDER_NAME,
          CONCAT(r.FIRST_NAME, ' ', r.LAST_NAME) as RECEIVER_NAME,
          omm.IS_READ
        FROM MESSAGE m
        JOIN MessageThread mt ON mt.MESSAGE_ID = m.PARENT_MESSAGE_ID
        LEFT JOIN OWNER s ON m.SENDER_ID = s.OWNER_ID
        LEFT JOIN OWNER r ON m.RECEIVER_ID = r.OWNER_ID
        JOIN OWNER_MESSAGE_MAP omm ON m.MESSAGE_ID = omm.MESSAGE_ID AND omm.OWNER_ID = ?
      )
      SELECT * FROM MessageThread
      ORDER BY CREATED ASC
    `, [req.params.messageId, req.userId, req.userId]);
    
    res.json(thread);
  } catch (error) {
    console.error('Error fetching message thread:', error);
    res.status(500).json({ error: 'An error occurred while fetching the message thread' });
  }
});

// Change Message Read Status Route
router.put('/messages/:messageId/read', verifyToken, async (req, res) => {
  try {
    await pool.query(`
      UPDATE OWNER_MESSAGE_MAP 
      SET IS_READ = 1 
      WHERE MESSAGE_ID = ? AND OWNER_ID = ?
    `, [req.params.messageId, req.userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'An error occurred while marking message as read' });
  }
});

// Owner Details Route
router.get('/owner/details', verifyToken, async (req, res) => {
  try {
    const [ownerData] = await pool.query(`
      SELECT 
        O.OWNER_ID,
        O.FIRST_NAME,
        O.LAST_NAME,
        O.EMAIL,
        O.PHONE,
        O.VOTING_RIGHTS,
        NP.EMAIL_ENABLED,
        NP.MESSAGES_ENABLED,
        NP.NEWS_DOCS_ENABLED,
        NP.PAYMENTS_ENABLED,
        NP.CHARGES_ENABLED,
        NP.DESCRIPTION as PREFERENCES_DESCRIPTION
      FROM OWNER O
      JOIN NOTIFICATION_PREFERENCES NP ON O.NOTIFICATION_PREF_ID = NP.PREF_ID
      WHERE O.OWNER_ID = ?`,
      [req.userId]
    );

    if (!ownerData.length) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    res.json(ownerData[0]);
  } catch (error) {
    console.error('Error fetching owner details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Owner Details Update Route (Personal)
router.put('/owner/personal-info', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { firstName, lastName } = req.body;

    await connection.query(
      `UPDATE OWNER 
       SET FIRST_NAME = ?, 
           LAST_NAME = ?
       WHERE OWNER_ID = ?`,
      [firstName, lastName, req.userId]
    );

    await connection.commit();
    res.json({ message: 'Personal information updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating personal info:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});


// Owner Details Update Route (Contact)
router.put('/owner/contact-info', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { email, phone } = req.body;

    await connection.query(
      `UPDATE OWNER 
       SET EMAIL = ?, 
           PHONE = ?
       WHERE OWNER_ID = ?`,
      [email, phone, req.userId]
    );

    await connection.commit();
    res.json({ message: 'Contact information updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating contact info:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

router.put('/owner/notification-preferences', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  console.log("Received request to update preferences");
  console.log("Request body:", req.body);
  
  try {
    await connection.beginTransaction();
    
    const {
      EMAIL_ENABLED,
      MESSAGES_ENABLED,
      NEWS_DOCS_ENABLED,
      PAYMENTS_ENABLED,
      CHARGES_ENABLED
    } = req.body;
    
    console.log("Extracted values:", {
      EMAIL_ENABLED,
      MESSAGES_ENABLED,
      NEWS_DOCS_ENABLED,
      PAYMENTS_ENABLED,
      CHARGES_ENABLED
    });

    // Find matching preference ID
    const query = `
      SELECT PREF_ID
      FROM NOTIFICATION_PREFERENCES
      WHERE EMAIL_ENABLED = ?
        AND MESSAGES_ENABLED = ?
        AND NEWS_DOCS_ENABLED = ?
        AND PAYMENTS_ENABLED = ?
        AND CHARGES_ENABLED = ?`;
    
    const params = [
      EMAIL_ENABLED,
      MESSAGES_ENABLED,
      NEWS_DOCS_ENABLED,
      PAYMENTS_ENABLED,
      CHARGES_ENABLED
    ];

    console.log("Executing query:", query);
    console.log("With parameters:", params);

    const [prefRow] = await connection.query(query, params);
    
    console.log("Query result:", prefRow);

    if (prefRow.length === 0) {
      console.log("No matching preference found for combination");
      throw new Error('Invalid preference combination');
    }

    console.log("Found matching preference ID:", prefRow[0].PREF_ID);

    // Update owner's preference ID
    await connection.query(
      'UPDATE OWNER SET NOTIFICATION_PREF_ID = ? WHERE OWNER_ID = ?',
      [prefRow[0].PREF_ID, req.userId]
    );

    console.log("Updated owner's preference ID successfully");

    await connection.commit();
    res.json({
      message: 'Notification preferences updated successfully',
      prefId: prefRow[0].PREF_ID,
      updatedPreferences: {
        EMAIL_ENABLED,
        MESSAGES_ENABLED,
        NEWS_DOCS_ENABLED,
        PAYMENTS_ENABLED,
        CHARGES_ENABLED
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating notification preferences:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({
      error: 'Failed to update notification preferences',
      details: error.message
    });
  } finally {
    connection.release();
  }
});

// Get detailed payment history
router.get('/payments/history', verifyToken, async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT 
        p.PAYMENT_ID,
        p.DATE_OF_PAYMENT,
        p.PAYMENT_AMOUNT,
        cc.CARD_TYPE,
        cc.CARD_NUMBER_LAST_4
      FROM PAYMENT p
      LEFT JOIN CREDIT_CARDS cc ON p.CARD_ID = cc.CARD_ID
      WHERE p.OWNER_ID = ?
      ORDER BY p.DATE_OF_PAYMENT DESC
    `, [req.userId]);

    const [charges] = await pool.query(`
      SELECT 
        ac.CHARGE_ID,
        COALESCE(ac.PAYMENT_DUE_DATE, ac.ASSESS_DATE) as DUE_DATE,
        COALESCE(vt.VIOLATION_RATE, ar.AMOUNT) as AMOUNT,
        vt.VIOLATION_DESCRIPTION,
        at.ASSESSMENT_DESCRIPTION,
        ac.ASSESS_DATE,
        ac.VIOLATION_DATE
      FROM ACCOUNT_CHARGE ac
      JOIN ACCOUNT a ON ac.ACCOUNT_ID = a.ACCOUNT_ID
      LEFT JOIN VIOLATION_TYPE vt ON ac.VIOLATION_TYPE_ID = vt.TYPE_ID
      LEFT JOIN ASSESSMENT_TYPE at ON ac.ASSESS_TYPE_ID = at.TYPE_ID
      LEFT JOIN ASSESSMENT_RATE ar ON ac.RATE_ID = ar.RATE_ID
      WHERE a.OWNER_ID = ?
      ORDER BY COALESCE(ac.PAYMENT_DUE_DATE, ac.ASSESS_DATE) DESC
    `, [req.userId]);

    res.json({ payments, charges });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all announcements (without file data)
router.get('/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.*,
        CASE 
          WHEN a.FILE_BLOB IS NOT NULL 
          THEN TO_BASE64(a.FILE_BLOB) 
          ELSE NULL 
        END as FILE_BLOB_BASE64
      FROM ANNOUNCEMENT_NEWS a
      WHERE STATUS = "PUBLISHED"
      ORDER BY a.CREATED DESC
    `);

    const announcements = rows.map(row => ({
      ...row,
      FILE_BLOB: row.FILE_BLOB_BASE64,
      // FILE_BLOB_BASE64: undefined // Remove the extra field
    }));


    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single announcement with details
router.get('/announcements/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ANNOUNCEMENT_NEWS WHERE ANNOUNCEMENT_ID = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new announcement
router.post('/announcements',
  verifyToken,
  verifyBoardMember,
  handleUpload,
  async (req, res) => {
    const connection = await pool.getConnection();
    console.log('Starting announcement creation process...');
    
    // Track the process for debugging
    const debug = {
      announcementCreated: false,
      emailsSent: 0,
      emailErrors: [],
      recipientsFound: 0,
      announcementId: null,
      hasAttachment: false
    };

    try {
      await connection.beginTransaction();
      const {
        title,
        message,
        type,
        eventDate,
        eventLocation,
        publishDate,
        status
      } = req.body;

      console.log('Announcement details:', {
        title,
        type,
        eventDate,
        eventLocation,
        publishDate,
        status,
        hasFile: !!req.file
      });

      // Handle file data
      const fileData = req.file ? {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        filename: req.file.originalname
      } : null;

      debug.hasAttachment = !!fileData;

      // Insert announcement
      const [result] = await connection.query(`
        INSERT INTO ANNOUNCEMENT_NEWS (
          TITLE,
          MESSAGE,
          TYPE,
          EVENT_DATE,
          EVENT_LOCATION,
          FILE_BLOB,
          FILE_MIME,
          FILE_NAME,
          CREATED,
          CREATED_BY,
          PUBLISH_DATE,
          STATUS
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
      `, [
        title,
        message,
        type,
        eventDate ? new Date(eventDate) : null,
        eventLocation,
        fileData?.buffer || null,
        fileData?.mimetype || null,
        fileData?.filename || null,
        req.boardMember.MEMBER_ID,
        publishDate ? new Date(publishDate) : new Date(),
        status || 'PUBLISHED'
      ]);

      debug.announcementCreated = true;
      debug.announcementId = result.insertId;
      console.log('Announcement inserted with ID:', result.insertId);

      // If status is PUBLISHED, send notifications
      if ((status || 'PUBLISHED') === 'PUBLISHED') {
        console.log('Announcement is published, preparing to send notifications');
        
        // Get all owners with news/docs notifications enabled
        const [recipients] = await connection.query(`
          SELECT o.EMAIL, o.FIRST_NAME, o.LAST_NAME 
          FROM OWNER o 
          WHERE o.NOTIFICATION_PREF_ID IN (1,6,7,8,9,14,15,16,17)
        `);

        debug.recipientsFound = recipients.length;
        console.log(`Found ${recipients.length} eligible recipients`);

        // Send emails to all eligible recipients
        for (const recipient of recipients) {
          try {
            const emailData = {
              to: recipient.EMAIL,
              subject: `New ${type} from Summit Ridge HOA`,
              template: 'newsDocument',
              context: {
                recipientName: `${recipient.FIRST_NAME} ${recipient.LAST_NAME}`,
                type,
                title,
                description: message,
                eventDate: eventDate ? new Date(eventDate).toLocaleDateString() : null,
                eventLocation,
                itemUrl: `${process.env.FRONTEND_URL}/news-events`,
                preferencesUrl: `${process.env.FRONTEND_URL}/owner-info`,
                hasAttachment: !!fileData
              }
            };

            console.log('Preparing email for:', recipient.EMAIL, {
              template: emailData.template,
              hasContext: !!emailData.context
            });

            await sendEmail(emailData);
            debug.emailsSent++;
            console.log('Email sent successfully to:', recipient.EMAIL);
          } catch (emailError) {
            console.error('Error sending email to:', recipient.EMAIL, {
              error: emailError.message,
              stack: emailError.stack
            });
            debug.emailErrors.push({
              email: recipient.EMAIL,
              error: emailError.message
            });
          }
        }

        console.log('Email sending complete:', {
          totalAttempted: recipients.length,
          successful: debug.emailsSent,
          failed: debug.emailErrors.length
        });
      }

      await connection.commit();
      console.log('Transaction committed successfully');

      res.status(201).json({
        message: 'Announcement created successfully',
        announcementId: result.insertId,
        debug: {
          ...debug,
          emailStats: {
            totalRecipients: debug.recipientsFound,
            emailsSent: debug.emailsSent,
            emailErrors: debug.emailErrors.length
          }
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error in announcement route:', {
        error: error.message,
        stack: error.stack,
        debug
      });
      res.status(500).json({ 
        error: 'Server error',
        details: error.message,
        debug
      });
    } finally {
      connection.release();
    }
});


// Update announcement
router.put('/announcements/:id', 
  verifyToken, 
  verifyBoardMember,
  handleUpload,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const {
        title,
        message,
        type,
        eventDate,
        eventLocation,
        publishDate,
        status
      } = req.body;

      const fileData = req.file ? {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        filename: req.file.originalname
      } : null;

      const updateSQL = `
        UPDATE ANNOUNCEMENT_NEWS 
        SET 
          TITLE = ?,
          MESSAGE = ?,
          TYPE = ?,
          EVENT_DATE = ?,
          EVENT_LOCATION = ?,
          PUBLISH_DATE = ?,
          STATUS = ?
          ${fileData ? ', FILE_BLOB = ?, FILE_MIME = ?, FILE_NAME = ?' : ''}
        WHERE ANNOUNCEMENT_ID = ?
      `;

      const updateParams = [
        title,
        message,
        type,
        eventDate ? new Date(eventDate) : null,
        eventLocation,
        publishDate ? new Date(publishDate) : null,
        status,
        ...(fileData ? [fileData.buffer, fileData.mimetype, fileData.filename] : []),
        id
      ];

      await connection.query(updateSQL, updateParams);
      await connection.commit();

      res.json({ message: 'Announcement updated successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating announcement:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      connection.release();
    }
});

// Delete announcement
router.delete('/announcements/:id', 
  verifyToken,
  verifyBoardMember,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      await connection.query(
        'DELETE FROM ANNOUNCEMENT_NEWS WHERE ANNOUNCEMENT_ID = ?',
        [req.params.id]
      );

      await connection.commit();
      res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting announcement:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      connection.release();
    }
});

// Get all documents
router.get('/documents', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        d.*,
        CASE 
          WHEN d.FILE_BLOB IS NOT NULL 
          THEN TO_BASE64(d.FILE_BLOB) 
          ELSE NULL 
        END as FILE_BLOB_BASE64
      FROM DOCUMENT d
      ORDER BY d.CREATED DESC
    `);

    const documents = rows.map(row => ({
      ...row,
      FILE_BLOB: row.FILE_BLOB_BASE64,
    }));

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload new document
router.post('/documents',
  verifyToken,
  verifyBoardMember,
  handleDocumentUpload,
  validateDocument,
  async (req, res) => {
    const connection = await pool.getConnection();
    
    // Track the process for debugging
    const debug = {
      documentCreated: false,
      emailsSent: 0,
      emailErrors: [],
      recipientsFound: 0,
      documentId: null,
      fileReceived: false,
      categoryValid: false
    };

    try {
      console.log('Starting document upload process...');
      await connection.beginTransaction();
      
      const {
        title,
        description,
        category
      } = req.body;

      // Handle file data
      const fileData = req.file ? {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        filename: req.file.originalname
      } : null;

      debug.fileReceived = !!fileData;
      console.log('File data received:', {
        hasFile: !!fileData,
        fileName: fileData?.filename,
        mimeType: fileData?.mimetype
      });

      if (!fileData) {
        throw new Error('No file provided');
      }

      // Validate category
      const validCategories = [
        'Governing Documents',
        'Meeting Minutes',
        'Financial Reports',
        'Forms',
        'Newsletters',
        'Other'
      ];

      debug.categoryValid = validCategories.includes(category);
      console.log('Category validation:', {
        category,
        isValid: debug.categoryValid
      });

      if (!validCategories.includes(category)) {
        throw new Error('Invalid document category');
      }

      // Insert document
      console.log('Inserting document into database...');
      const [result] = await connection.query(`
        INSERT INTO DOCUMENT (
          FILE_NAME,
          DESCRIPTION,
          CATEGORY,
          FILE_BLOB,
          FILE_MIME,
          CREATED,
          CREATED_BY
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?)
      `, [
        title || fileData.filename,
        description,
        category,
        fileData.buffer,
        fileData.mimetype,
        req.boardMember.MEMBER_ID
      ]);

      debug.documentCreated = true;
      debug.documentId = result.insertId;
      console.log('Document inserted with ID:', result.insertId);

      // Get all owners with news/docs notifications enabled
      console.log('Fetching eligible recipients...');
      const [recipients] = await connection.query(`
        SELECT o.EMAIL, o.FIRST_NAME, o.LAST_NAME 
        FROM OWNER o 
        WHERE o.NOTIFICATION_PREF_ID IN (1,6,7,8,9,14,15,16,17)
      `);

      debug.recipientsFound = recipients.length;
      console.log(`Found ${recipients.length} eligible recipients`);

      // Send emails to all eligible recipients
      for (const recipient of recipients) {
        try {
          console.log('Preparing email for:', recipient.EMAIL);
          
          const emailData = {
            to: recipient.EMAIL,
            subject: 'New Document Available - Summit Ridge HOA',
            template: 'newsDocument',
            context: {
              recipientName: `${recipient.FIRST_NAME} ${recipient.LAST_NAME}`,
              type: 'Document',
              title: title || fileData.filename,
              description,
              category,
              itemUrl: `${process.env.FRONTEND_URL}/documents`,
              preferencesUrl: `${process.env.FRONTEND_URL}/owner-info`,
              hasAttachment: true
            }
          };

          await sendEmail(emailData);
          debug.emailsSent++;
          console.log('Email sent successfully to:', recipient.EMAIL);
        } catch (emailError) {
          console.error('Error sending email to:', recipient.EMAIL, {
            error: emailError.message,
            stack: emailError.stack
          });
          debug.emailErrors.push({
            email: recipient.EMAIL,
            error: emailError.message
          });
          // Continue with other recipients even if one fails
        }
      }

      console.log('Email sending complete:', {
        totalAttempted: recipients.length,
        successful: debug.emailsSent,
        failed: debug.emailErrors.length
      });

      await connection.commit();
      console.log('Transaction committed successfully');

      res.status(201).json({
        message: 'Document uploaded successfully',
        documentId: result.insertId,
        debug: {
          ...debug,
          emailStats: {
            totalRecipients: debug.recipientsFound,
            emailsSent: debug.emailsSent,
            emailErrors: debug.emailErrors.length
          }
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error in document upload:', {
        error: error.message,
        stack: error.stack,
        debug
      });

      // Determine appropriate status code
      const statusCode = error.message.includes('No file provided') || 
                        error.message.includes('Invalid document category') 
                        ? 400 : 500;

      res.status(statusCode).json({
        error: error.message,
        debug
      });
    } finally {
      connection.release();
    }
});

// Update document
router.put('/documents/:id',
  verifyToken,
  verifyBoardMember,
  handleUpload,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const { title, description } = req.body;
      
      // Handle file data if present
      const fileData = req.file ? {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        filename: req.file.originalname
      } : null;

      let updateSQL;
      let updateParams;

      if (fileData) {
        updateSQL = `
          UPDATE DOCUMENT 
          SET 
            FILE_NAME = ?,
            DESCRIPTION = ?,
            FILE_BLOB = ?,
            FILE_MIME = ?
          WHERE DOCUMENT_ID = ?
        `;
        updateParams = [
          fileData.filename,
          description,
          fileData.buffer,
          fileData.mimetype,
          id
        ];
      } else {
        updateSQL = `
          UPDATE DOCUMENT 
          SET 
            FILE_NAME = ?,
            DESCRIPTION = ?
          WHERE DOCUMENT_ID = ?
        `;
        updateParams = [title, description, id];
      }

      await connection.query(updateSQL, updateParams);
      await connection.commit();

      res.json({ message: 'Document updated successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating document:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      connection.release();
    }
});

// Delete document
router.delete('/documents/:id',
  verifyToken,
  verifyBoardMember,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        'DELETE FROM DOCUMENT WHERE DOCUMENT_ID = ?',
        [req.params.id]
      );

      await connection.commit();
      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      connection.release();
    }
});

// Download document
router.get('/documents/:id/download',
  verifyToken,
  async (req, res) => {
    try {
      const [document] = await pool.query(
        'SELECT FILE_BLOB, FILE_MIME, FILE_NAME FROM DOCUMENT WHERE DOCUMENT_ID = ?',
        [req.params.id]
      );

      if (!document.length) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const file = document[0];
      res.setHeader('Content-Type', file.FILE_MIME);
      res.setHeader('Content-Disposition', `attachment; filename=${file.FILE_NAME}`);
      res.send(file.FILE_BLOB);
    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Get all violation types
router.get('/violation-types',
  verifyToken,
  verifyBoardMember,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM VIOLATION_TYPE ORDER BY VIOLATION_DESCRIPTION'
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching violation types:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Create new violation type
router.post('/violation-types', verifyToken, verifyBoardMember, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { description, rate } = req.body;

    const [result] = await connection.query(
      'INSERT INTO VIOLATION_TYPE (VIOLATION_DESCRIPTION, VIOLATION_RATE) VALUES (?, ?)',
      [description, rate]
    );

    // Get all board members for notification
    const [boardMembers] = await connection.query(`
      SELECT DISTINCT o.EMAIL
      FROM OWNER o
      JOIN OWNER_BOARD_MEMBER_MAP obm ON o.OWNER_ID = obm.OWNER_ID
      WHERE obm.START_DATE <= CURRENT_DATE 
      AND (obm.END_DATE IS NULL OR obm.END_DATE >= CURRENT_DATE)
    `);

    // Send notification to all board members
    for (const member of boardMembers) {
      await sendEmail({
        to: member.EMAIL,
        subject: 'New Violation Type Added - Summit Ridge HOA',
        template: 'violationType',
        context: {
          description,
          rate: rate.toFixed(2),
          addedBy: req.boardMember.MEMBER_ROLE, // From verifyBoardMember middleware
          date: new Date()
        }
      });
    }

    await connection.commit();
    
    res.status(201).json({
      message: 'Violation type created successfully',
      typeId: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating violation type:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

// Update violation type
router.put('/violation-types/:id',
  verifyToken,
  verifyBoardMember,
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { description, rate } = req.body;
      const typeId = req.params.id;

      await connection.query(
        'UPDATE VIOLATION_TYPE SET VIOLATION_DESCRIPTION = ?, VIOLATION_RATE = ? WHERE TYPE_ID = ?',
        [description, rate, typeId]
      );

      await connection.commit();
      res.json({ message: 'Violation type updated successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating violation type:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      connection.release();
    }
});

// Get active owners
router.get('/active-owners',
  verifyToken,
  verifyBoardMember,
  async (req, res) => {
    try {
      const [owners] = await pool.query(`
        SELECT DISTINCT o.*, p.UNIT, p.STREET, p.CITY, p.STATE, p.ZIP_CODE
        FROM OWNER o
        JOIN PROPERTY_OWNER_MAP pom ON o.OWNER_ID = pom.OWNER_ID
        JOIN PROPERTY p ON pom.PROPERTY_ID = p.PROP_ID
        JOIN ACCOUNT a ON a.PROPERTY_ID = p.PROP_ID
        WHERE 
          CURRENT_DATE >= pom.PURCHASE_DATE 
          AND (pom.SELL_DATE IS NULL OR CURRENT_DATE <= pom.SELL_DATE)
        ORDER BY o.LAST_NAME, o.FIRST_NAME
      `);
      
      res.json(owners);
    } catch (error) {
      console.error('Error fetching active owners:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// New Violation
router.post('/violations',
  verifyToken,
  verifyBoardMember,
  async (req, res) => {
    const connection = await pool.getConnection();
    const debug = {
      chargeCreated: false,
      messageCreated: false,
      emailSent: false,
      chargeId: null,
      messageId: null,
      errors: []
    };

    try {
      console.log('Starting violation processing...');
      await connection.beginTransaction();

      const { ownerId, violationTypeId, violationDate } = req.body;
      console.log('Violation details:', { ownerId, violationTypeId, violationDate });

      // Get account information
      const [accountRows] = await connection.query(`
        SELECT a.* 
        FROM ACCOUNT a
        JOIN PROPERTY_OWNER_MAP pom ON a.PROPERTY_ID = pom.PROPERTY_ID
        WHERE pom.OWNER_ID = ?
          AND CURRENT_DATE >= pom.PURCHASE_DATE 
          AND (pom.SELL_DATE IS NULL OR CURRENT_DATE <= pom.SELL_DATE)
      `, [ownerId]);

      if (accountRows.length === 0) {
        throw new Error('No active account found for this owner');
      }

      const account = accountRows[0];
      console.log('Account found:', account.ACCOUNT_ID);

      // Get violation type information
      const [violationRows] = await connection.query(
        'SELECT * FROM VIOLATION_TYPE WHERE TYPE_ID = ?',
        [violationTypeId]
      );

      if (violationRows.length === 0) {
        throw new Error('Invalid violation type');
      }

      const violation = violationRows[0];
      console.log('Violation type found:', violation.VIOLATION_DESCRIPTION);

      // Calculate due date (30 days from violation date)
      const violationDateObj = new Date(violationDate);
      const dueDate = new Date(violationDateObj);
      dueDate.setDate(dueDate.getDate() + 30);

      // Create account charge
      const [chargeResult] = await connection.query(`
        INSERT INTO ACCOUNT_CHARGE (
          ACCOUNT_ID,
          CHARGE_TYPE,
          PAYMENT_DUE_DATE,
          VIOLATION_DATE,
          VIOLATION_TYPE_ID,
          ISSUED_BY
        ) VALUES (?, 'violation', ?, ?, ?, ?)
      `, [
        account.ACCOUNT_ID,
        dueDate,
        violationDateObj,
        violationTypeId,
        req.boardMember.MEMBER_ID
      ]);

      debug.chargeCreated = true;
      debug.chargeId = chargeResult.insertId;
      console.log('Charge created:', chargeResult.insertId);

      // Update account balance
      await connection.query(
        'UPDATE ACCOUNT SET BALANCE = BALANCE + ? WHERE ACCOUNT_ID = ?',
        [violation.VIOLATION_RATE, account.ACCOUNT_ID]
      );

      // Get property information
      const [propertyRows] = await connection.query(`
        SELECT p.* 
        FROM PROPERTY p
        JOIN PROPERTY_OWNER_MAP pom ON p.PROP_ID = pom.PROPERTY_ID
        WHERE pom.OWNER_ID = ?
          AND CURRENT_DATE >= pom.PURCHASE_DATE 
          AND (pom.SELL_DATE IS NULL OR CURRENT_DATE <= pom.SELL_DATE)
      `, [ownerId]);

      const property = propertyRows[0];

      // Get owner details with proper notification preferences
      const [ownerDetails] = await connection.query(`
        SELECT o.EMAIL, o.FIRST_NAME, o.LAST_NAME
        FROM OWNER o
        WHERE o.OWNER_ID = ? 
        AND o.NOTIFICATION_PREF_ID IN (1,3,5,7,9,11,13,15,17)`,
        [ownerId]
      );

      // Create system message
      const messageText = `A violation has been recorded for your property at ${property.UNIT} ${property.STREET}.\n\n` +
        `Violation Type: ${violation.VIOLATION_DESCRIPTION}\n` +
        `Date of Violation: ${violationDateObj.toLocaleDateString()}\n` +
        `Amount Due: $${violation.VIOLATION_RATE}\n` +
        `Due Date: ${dueDate.toLocaleDateString()}`;

      const [messageResult] = await connection.query(`
        INSERT INTO MESSAGE (
          SENDER_ID,
          RECEIVER_ID,
          MESSAGE,
          CREATED
        ) VALUES (999999999, ?, ?, NOW())
      `, [ownerId, messageText]);

      debug.messageCreated = true;
      debug.messageId = messageResult.insertId;
      console.log('Message created:', messageResult.insertId);

      // Create owner message map entries
      await connection.query(`
        INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID)
        VALUES (?, ?), (999999999, ?)
      `, [ownerId, messageResult.insertId, messageResult.insertId]);

      // Send email if eligible
      if (ownerDetails.length > 0) {
        try {
          console.log('Sending violation email to:', ownerDetails[0].EMAIL);
          
          await sendEmail({
            to: ownerDetails[0].EMAIL,
            subject: 'HOA Violation Notice - Summit Ridge HOA',
            template: 'violation',
            context: {
              recipientName: `${ownerDetails[0].FIRST_NAME} ${ownerDetails[0].LAST_NAME}`,
              violationType: violation.VIOLATION_DESCRIPTION,
              violationDate: violationDateObj.toLocaleDateString(),
              amount: formatCurrency(parseFloat(violation.VIOLATION_RATE)),
              dueDate: dueDate.toLocaleDateString(),
              propertyAddress: `${property.UNIT} ${property.STREET}`,
              accountUrl: `${process.env.FRONTEND_URL}/payments`
            }
          });
          
          debug.emailSent = true;
          console.log('Violation email sent successfully');
        } catch (emailError) {
          console.error('Error sending violation email:', emailError);
          debug.errors.push({
            type: 'email',
            error: emailError.message
          });
        }
      }

      await connection.commit();
      console.log('Transaction committed successfully');

      res.status(201).json({
        message: 'Violation issued successfully',
        chargeId: chargeResult.insertId,
        messageId: messageResult.insertId,
        debug
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error issuing violation:', {
        error: error.message,
        stack: error.stack,
        debug
      });
      res.status(500).json({ 
        error: error.message || 'Server error',
        debug
      });
    } finally {
      connection.release();
    }
});

// Get assessment types
router.get('/assessments/types', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ASSESSMENT_TYPE ORDER BY TYPE_ID');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching assessment types:', error);
    res.status(500).json({ error: 'Failed to fetch assessment types' });
  }
});

// Get assessment rates
router.get('/assessments/rates', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ASSESSMENT_RATE ORDER BY RATE_ID DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching assessment rates:', error);
    res.status(500).json({ error: 'Failed to fetch assessment rates' });
  }
});

// Add batch of assessment types
router.post('/assessments/types/batch', verifyToken, verifyBoardMember, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { types } = req.body;
    const insertPromises = types.map(type => 
      connection.query(
        'INSERT INTO ASSESSMENT_TYPE (ASSESSMENT_DESCRIPTION) VALUES (?)',
        [type.description]
      )
    );

    await Promise.all(insertPromises);
    await connection.commit();
    
    res.json({ message: 'Assessment types added successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding assessment types:', error);
    res.status(500).json({ error: 'Failed to add assessment types' });
  } finally {
    connection.release();
  }
});

// Add batch of assessment types
router.post('/assessments/rates/batch', verifyToken, verifyBoardMember, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { rates } = req.body;
    
    // Handle each rate insertion sequentially
    for (const rate of rates) {
      if (rate.isYearlyAssessment) {
        // First, unset any existing yearly assessment for this year
        await connection.query(
          'UPDATE ASSESSMENT_RATE SET IS_YEARLY_ASSESSMENT = FALSE WHERE ASSESSMENT_YEAR = ?',
          [rate.year]
        );
      }

      // Insert the new rate
      await connection.query(
        `INSERT INTO ASSESSMENT_RATE (
          ASSESSMENT_YEAR, 
          AMOUNT, 
          CHANGED_BY, 
          IS_YEARLY_ASSESSMENT
        ) VALUES (?, ?, ?, ?)`,
        [
          rate.year || null,
          rate.amount,
          rate.changedBy,
          rate.isYearlyAssessment
        ]
      );
    }

    await connection.commit();
    res.json({ message: 'Assessment rates added successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding assessment rates:', error);
    res.status(500).json({ error: 'Failed to add assessment rates' });
  } finally {
    connection.release();
  }
});

// Add a new route to get the yearly assessment rate for automation
router.get('/assessments/yearly-rate/:year', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ar.*, at.ASSESSMENT_DESCRIPTION
       FROM ASSESSMENT_RATE ar
       JOIN ASSESSMENT_TYPE at ON at.TYPE_ID = 1  -- Assuming 1 is Regular Assessment
       WHERE ar.ASSESSMENT_YEAR = ? 
       AND ar.IS_YEARLY_ASSESSMENT = TRUE
       LIMIT 1`,
      [req.params.year]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No yearly assessment rate found for specified year' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching yearly assessment rate:', error);
    res.status(500).json({ error: 'Failed to fetch yearly assessment rate' });
  }
});

// Get active owners with search
router.get('/owners/active', verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    const [rows] = await pool.query(`
      SELECT DISTINCT 
        o.OWNER_ID, o.FIRST_NAME, o.LAST_NAME,
        p.UNIT, p.STREET, p.CITY, p.STATE, p.ZIP_CODE,
        a.ACCOUNT_ID
      FROM OWNER o
      JOIN PROPERTY_OWNER_MAP pom ON o.OWNER_ID = pom.OWNER_ID
      JOIN PROPERTY p ON pom.PROPERTY_ID = p.PROP_ID
      JOIN ACCOUNT a ON o.OWNER_ID = a.OWNER_ID
      WHERE 
        o.OWNER_ID != 999999999
        AND pom.PURCHASE_DATE <= CURRENT_DATE
        AND (pom.SELL_DATE IS NULL OR pom.SELL_DATE > CURRENT_DATE)
        AND (
          o.FIRST_NAME LIKE ? 
          OR o.LAST_NAME LIKE ? 
          OR CONCAT(p.UNIT, ' ', p.STREET) LIKE ?
        )
    `, [`%${search}%`, `%${search}%`, `%${search}%`]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error searching active owners:', error);
    res.status(500).json({ error: 'Failed to search owners' });
  }
});

// Get all active owners
router.get('/owners/active/all', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT 
        o.OWNER_ID, o.FIRST_NAME, o.LAST_NAME,
        p.UNIT, p.STREET, p.CITY, p.STATE, p.ZIP_CODE,
        a.ACCOUNT_ID
      FROM OWNER o
      JOIN PROPERTY_OWNER_MAP pom ON o.OWNER_ID = pom.OWNER_ID
      JOIN PROPERTY p ON pom.PROPERTY_ID = p.PROP_ID
      JOIN ACCOUNT a ON o.OWNER_ID = a.OWNER_ID
      WHERE 
        o.OWNER_ID != 999999999
        AND pom.PURCHASE_DATE <= CURRENT_DATE
        AND (pom.SELL_DATE IS NULL OR pom.SELL_DATE > CURRENT_DATE)
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all active owners:', error);
    res.status(500).json({ error: 'Failed to fetch owners' });
  }
});

// Issue assessments
router.post('/assessments/issue', 
  verifyToken, 
  verifyBoardMember, 
  async (req, res) => {
    const connection = await pool.getConnection();
    const debug = {
      assessmentsCreated: 0,
      messagesCreated: 0,
      emailsSent: 0,
      errors: [],
      ownerResults: []
    };

    try {
      console.log('Starting assessment issuance process...');
      await connection.beginTransaction();
   
      const { typeId, rateId, amount, owners, issuedBy } = req.body;
      const validatedAmount = validateAmount(amount);
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const assessDate = new Date();

      console.log('Assessment details:', {
        typeId,
        rateId,
        amount: validatedAmount,
        ownersCount: owners.length,
        dueDate,
        assessDate
      });

      // Get assessment type description
      const [assessmentType] = await connection.query(
        'SELECT ASSESSMENT_DESCRIPTION FROM ASSESSMENT_TYPE WHERE TYPE_ID = ?',
        [typeId]
      );

      if (!assessmentType.length) {
        throw new Error('Invalid assessment type');
      }

      console.log('Assessment type:', assessmentType[0].ASSESSMENT_DESCRIPTION);

      for (const owner of owners) {
        const ownerDebug = {
          ownerId: owner.ownerId,
          chargeCreated: false,
          messageCreated: false,
          emailSent: false,
          errors: []
        };

        try {
          // Get owner details with proper notification preferences
          const [ownerDetails] = await connection.query(`
            SELECT o.EMAIL, o.FIRST_NAME, o.LAST_NAME
            FROM OWNER o
            WHERE o.OWNER_ID = ? 
            AND o.NOTIFICATION_PREF_ID IN (1,3,5,7,9,11,13,15,17)`,
            [owner.ownerId]
          );

          // Create message
          const [messageResult] = await connection.query(
            `INSERT INTO MESSAGE (SENDER_ID, RECEIVER_ID, MESSAGE, CREATED)
             VALUES (?, ?, ?, NOW())`,
            [
              999999999,
              owner.ownerId,
              `Assessment Notice: ${assessmentType[0].ASSESSMENT_DESCRIPTION}\nAmount: $${formatCurrency(validatedAmount)}\nDue Date: ${dueDate.toLocaleDateString()}\n\nPlease log in to your account to view details or make a payment.`
            ]
          );

          ownerDebug.messageCreated = true;
          debug.messagesCreated++;

          // Create account charge
          const [chargeResult] = await connection.query(
            `INSERT INTO ACCOUNT_CHARGE (
              ACCOUNT_ID, CHARGE_TYPE, PAYMENT_DUE_DATE, ASSESS_DATE,
              RATE_ID, ASSESS_TYPE_ID, ISSUED_BY
            ) VALUES (?, 'assessment', ?, ?, ?, ?, ?)`,
            [
              owner.accountId,
              dueDate,
              assessDate,
              rateId,
              typeId,
              issuedBy
            ]
          );

          ownerDebug.chargeCreated = true;
          debug.assessmentsCreated++;

          // Update account balance
          await connection.query(
            `UPDATE ACCOUNT
             SET BALANCE = BALANCE + ?
             WHERE ACCOUNT_ID = ?`,
            [validatedAmount, owner.accountId]
          );

          // Map message to owner
          await connection.query(
            `INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID)
             VALUES (?, ?)`,
            [owner.ownerId, messageResult.insertId]
          );

          // Send email notification if eligible
          if (ownerDetails.length > 0) {
            try {
              console.log('Sending assessment email to:', ownerDetails[0].EMAIL);

              await sendEmail({
                to: ownerDetails[0].EMAIL,
                subject: 'New Assessment Notice - Summit Ridge HOA',
                template: 'assessment',
                context: {
                  recipientName: `${ownerDetails[0].FIRST_NAME} ${ownerDetails[0].LAST_NAME}`,
                  assessmentType: assessmentType[0].ASSESSMENT_DESCRIPTION,
                  amount: formatCurrency(validatedAmount),
                  dueDate: dueDate.toLocaleDateString(),
                  accountUrl: `${process.env.FRONTEND_URL}/payments`
                }
              });

              ownerDebug.emailSent = true;
              debug.emailsSent++;
              console.log('Assessment email sent successfully to:', ownerDetails[0].EMAIL);
            } catch (emailError) {
              console.error('Error sending assessment email:', emailError);
              ownerDebug.errors.push({
                type: 'email',
                error: emailError.message
              });
            }
          }

        } catch (ownerError) {
          console.error('Error processing owner:', owner.ownerId, ownerError);
          ownerDebug.errors.push({
            type: 'processing',
            error: ownerError.message
          });
        }

        debug.ownerResults.push(ownerDebug);
      }

      console.log('Assessment process complete:', {
        totalOwners: owners.length,
        assessmentsCreated: debug.assessmentsCreated,
        messagesCreated: debug.messagesCreated,
        emailsSent: debug.emailsSent
      });

      await connection.commit();

      res.json({
        message: 'Assessments issued successfully',
        debug: {
          ...debug,
          success: debug.assessmentsCreated === owners.length
        }
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error issuing assessments:', {
        error: error.message,
        stack: error.stack,
        debug
      });
      res.status(500).json({ 
        error: 'Failed to issue assessments',
        details: error.message,
        debug
      });
    } finally {
      connection.release();
    }
});

// Get all board member roles
router.get('/board-members/roles', verifyToken, verifyBoardMember, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM BOARD_MEMBER_ADMIN ORDER BY MEMBER_ID'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching board member roles:', error);
    res.status(500).json({ error: 'Failed to fetch board member roles' });
  }
});

// Update board member role
router.put('/board-members/roles/:id', verifyToken, verifyBoardMember, async (req, res) => {
  const memberId = parseInt(req.params.id);
  const { MEMBER_ROLE, ASSESS_FINES, CHANGE_RATES, CHANGE_MEMBERS } = req.body;

  // Check if trying to modify protected roles
  if (memberId === 1 || memberId === 4) {
    return res.status(403).json({ error: 'Cannot modify protected roles' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verify the role exists
    const [existingRole] = await connection.query(
      'SELECT * FROM BOARD_MEMBER_ADMIN WHERE MEMBER_ID = ?',
      [memberId]
    );

    if (existingRole.length === 0) {
      throw new Error('Role not found');
    }

    await connection.query(
      `UPDATE BOARD_MEMBER_ADMIN 
       SET MEMBER_ROLE = ?, 
           ASSESS_FINES = ?, 
           CHANGE_RATES = ?, 
           CHANGE_MEMBERS = ?
       WHERE MEMBER_ID = ?`,
      [MEMBER_ROLE, ASSESS_FINES, CHANGE_RATES, CHANGE_MEMBERS, memberId]
    );

    await connection.commit();
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating board member role:', error);
    res.status(500).json({ error: 'Failed to update board member role' });
  } finally {
    connection.release();
  }
});

// Add new board member role
router.post('/board-members/roles', verifyToken, verifyBoardMember, async (req, res) => {
  const { MEMBER_ROLE, ASSESS_FINES, CHANGE_RATES, CHANGE_MEMBERS } = req.body;

  if (!MEMBER_ROLE) {
    return res.status(400).json({ error: 'Member role is required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if role name already exists
    const [existingRole] = await connection.query(
      'SELECT * FROM BOARD_MEMBER_ADMIN WHERE MEMBER_ROLE = ?',
      [MEMBER_ROLE]
    );

    if (existingRole.length > 0) {
      throw new Error('Role name already exists');
    }

    const [result] = await connection.query(
      `INSERT INTO BOARD_MEMBER_ADMIN (
        MEMBER_ROLE, ASSESS_FINES, CHANGE_RATES, CHANGE_MEMBERS
      ) VALUES (?, ?, ?, ?)`,
      [MEMBER_ROLE, ASSESS_FINES, CHANGE_RATES, CHANGE_MEMBERS]
    );

    await connection.commit();
    res.status(201).json({ 
      message: 'Role added successfully',
      memberId: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding board member role:', error);
    res.status(500).json({ error: error.message || 'Failed to add board member role' });
  } finally {
    connection.release();
  }
});

// Get active board members
router.get('/board-members/active', verifyToken, verifyBoardMember, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        obm.OWNER_ID,
        obm.BOARD_MEMBER_ID,
        obm.START_DATE,
        obm.END_DATE,
        o.FIRST_NAME,
        o.LAST_NAME,
        bma.MEMBER_ROLE,
        bma.ASSESS_FINES,
        bma.CHANGE_RATES,
        bma.CHANGE_MEMBERS
      FROM OWNER_BOARD_MEMBER_MAP obm
      JOIN OWNER o ON obm.OWNER_ID = o.OWNER_ID
      JOIN BOARD_MEMBER_ADMIN bma ON obm.BOARD_MEMBER_ID = bma.MEMBER_ID
      WHERE (obm.END_DATE IS NULL OR obm.END_DATE > CURRENT_DATE)
        AND obm.START_DATE <= CURRENT_DATE
      ORDER BY o.LAST_NAME, o.FIRST_NAME
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching active board members:', error);
    res.status(500).json({ error: 'Failed to fetch active board members' });
  }
});

// End board member role
router.put('/board-members/map/:ownerId/:boardMemberId/end', verifyToken, verifyBoardMember, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { ownerId, boardMemberId } = req.params;
    
    // Validate not trying to modify admin or self
    if (parseInt(ownerId) === 999999999) {
      throw new Error('Cannot modify administrator role');
    }
    
    if (parseInt(ownerId) === parseInt(req.userId)) {
      throw new Error('Cannot modify your own role');
    }

    // First verify the role exists and is active
    const [currentRole] = await connection.query(`
      SELECT * FROM OWNER_BOARD_MEMBER_MAP
      WHERE BOARD_MEMBER_ID = ? 
      AND OWNER_ID = ?
      AND START_DATE <= CURRENT_DATE
      AND (END_DATE IS NULL OR END_DATE > CURRENT_DATE)
    `, [boardMemberId, ownerId]);

    if (currentRole.length === 0) {
      throw new Error('No active board member role found');
    }

    // Update end date to current date
    await connection.query(`
      UPDATE OWNER_BOARD_MEMBER_MAP
      SET END_DATE = CURRENT_DATE
      WHERE BOARD_MEMBER_ID = ? 
      AND OWNER_ID = ?
      AND START_DATE <= CURRENT_DATE
      AND (END_DATE IS NULL OR END_DATE > CURRENT_DATE)
    `, [boardMemberId, ownerId]);

    await connection.commit();
    res.json({ 
      success: true,
      message: 'Board member role ended successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error ending board member role:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to end board member role' 
    });
  } finally {
    connection.release();
  }
});


// Add new board member
// router.post('/board-members', verifyToken, verifyBoardMember, async (req, res) => {
//   const connection = await pool.getConnection();
//   try {
//     await connection.beginTransaction();
    
//     const { ownerId, roleId } = req.body;
    
//     // Check not adding admin role
//     if (roleId === 1) {
//       throw new Error('Cannot assign administrator role');
//     }

//     // Verify owner is active
//     const [ownerRows] = await connection.query(`
//       SELECT o.* 
//       FROM OWNER o
//       JOIN PROPERTY_OWNER_MAP pom ON o.OWNER_ID = pom.OWNER_ID
//       WHERE o.OWNER_ID = ?
//         AND pom.PURCHASE_DATE <= CURRENT_DATE 
//         AND (pom.SELL_DATE IS NULL OR pom.SELL_DATE > CURRENT_DATE)
//     `, [ownerId]);

//     if (ownerRows.length === 0) {
//       throw new Error('Invalid or inactive owner');
//     }

//     // Check if owner already has an active role
//     const [existingRole] = await connection.query(`
//       SELECT * FROM OWNER_BOARD_MEMBER_MAP
//       WHERE OWNER_ID = ?
//         AND START_DATE <= CURRENT_DATE
//         AND (END_DATE IS NULL OR END_DATE >= CURRENT_DATE)
//     `, [ownerId]);

//     console.log(existingRole);

//     if (existingRole.length > 0) {
//       throw new Error('Owner already has an active board member role');
//     }

//     // Add new board member role
//     await connection.query(`
//       INSERT INTO OWNER_BOARD_MEMBER_MAP (
//         OWNER_ID,
//         BOARD_MEMBER_ID,
//         START_DATE
//       ) VALUES (?, ?, CURRENT_DATE)
//     `, [ownerId, roleId]);

//     await connection.commit();
//     res.status(201).json({ message: 'Board member added successfully' });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Error adding board member:', error);
//     res.status(500).json({ error: error.message || 'Failed to add board member' });
//   } finally {
//     connection.release();
//   }
// });

router.post('/board-members', verifyToken, verifyBoardMember, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { ownerId, roleId } = req.body;
    
    // Prevent assigning administrator role
    if (roleId === 1) {
      throw new Error('Cannot assign administrator role');
    }

    // Verify owner is active
    const [ownerRows] = await connection.query(`
      SELECT o.* 
      FROM OWNER o
      JOIN PROPERTY_OWNER_MAP pom ON o.OWNER_ID = pom.OWNER_ID
      WHERE o.OWNER_ID = ?
        AND pom.PURCHASE_DATE <= CURRENT_DATE 
        AND (pom.SELL_DATE IS NULL OR pom.SELL_DATE > CURRENT_DATE)
    `, [ownerId]);

    if (ownerRows.length === 0) {
      throw new Error('Invalid or inactive owner');
    }

    // Check if owner already has an active role with the same roleId
    const [existingRole] = await connection.query(`
      SELECT * FROM OWNER_BOARD_MEMBER_MAP
      WHERE OWNER_ID = ?
        AND BOARD_MEMBER_ID = ?
        AND START_DATE <= CURRENT_DATE
        AND (END_DATE IS NULL OR END_DATE >= CURRENT_DATE)
    `, [ownerId, roleId]);

    if (existingRole.length > 0) {
      // If same roleId exists, update start_date and clear end_date
      await connection.query(`
        UPDATE OWNER_BOARD_MEMBER_MAP
        SET START_DATE = CURRENT_DATE, END_DATE = NULL
        WHERE OWNER_ID = ? AND BOARD_MEMBER_ID = ?
      `, [ownerId, roleId]);
    } else {
      // Check if owner has any active role regardless of roleId
      const [activeRole] = await connection.query(`
        SELECT * FROM OWNER_BOARD_MEMBER_MAP
        WHERE OWNER_ID = ?
          AND START_DATE <= CURRENT_DATE
          AND (END_DATE IS NULL OR END_DATE > CURRENT_DATE)
      `, [ownerId]);

      if (activeRole.length > 0) {
        throw new Error('Owner already has an active board member role');
      }

      // Insert new role if no active role exists
      await connection.query(`
        INSERT INTO OWNER_BOARD_MEMBER_MAP (
          OWNER_ID,
          BOARD_MEMBER_ID,
          START_DATE
        ) VALUES (?, ?, CURRENT_DATE)
      `, [ownerId, roleId]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Board member added successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding board member:', error);
    res.status(500).json({ error: error.message || 'Failed to add board member' });
  } finally {
    connection.release();
  }
});


// Get available properties
router.get('/properties/available', verifyToken, verifyBoardMember, async (req, res) => {
  try {
    const [properties] = await pool.query(`
      SELECT p.* 
      FROM PROPERTY p
      WHERE EXISTS (
        SELECT 1 
        FROM PROPERTY_OWNER_MAP pom 
        WHERE pom.PROPERTY_ID = p.PROP_ID 
        AND pom.SELL_DATE IS NULL
      )
      ORDER BY p.STREET, p.UNIT
    `);
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching available properties:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new account
router.post('/accounts/create', verifyToken, verifyBoardMember, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { propertyId, effectiveDate } = req.body;
    
    // Generate random temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create new owner
    const [ownerResult] = await connection.query(`
      INSERT INTO OWNER (PASSWORD_HASH, IS_TEMPORARY_PASSWORD) 
      VALUES (?, TRUE)
    `, [hashedPassword]);
    const newOwnerId = ownerResult.insertId;
    
    // Update property ownership
    await connection.query(`
      UPDATE PROPERTY_OWNER_MAP 
      SET SELL_DATE = ? 
      WHERE PROPERTY_ID = ? AND SELL_DATE IS NULL
    `, [effectiveDate, propertyId]);
    
    await connection.query(`
      INSERT INTO PROPERTY_OWNER_MAP (PROPERTY_ID, OWNER_ID, PURCHASE_DATE) 
      VALUES (?, ?, ?)
    `, [propertyId, newOwnerId, effectiveDate]);
    
    // Create new account
    const [accountResult] = await connection.query(`
      INSERT INTO ACCOUNT (OWNER_ID, PROPERTY_ID, BALANCE) 
      VALUES (?, ?, 0.00)
    `, [newOwnerId, propertyId]);
    
    // Create system message
    const messageContent = `
New account created:
Account Number: ${accountResult.insertId}
Owner ID: ${newOwnerId}
Temporary Code: ${tempPassword}

Please provide this information to the closing agent or law firm handling the closing.
    `.trim();
    
    const [messageResult] = await connection.query(`
      INSERT INTO MESSAGE (SENDER_ID, MESSAGE, CREATED) 
      VALUES (999999999, ?, NOW())
    `, [messageContent]);
    
    await connection.query(`
      INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID) 
      VALUES (?, ?)
    `, [req.userId, messageResult.insertId]);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: {
        accountId: accountResult.insertId,
        ownerId: newOwnerId,
        temporaryCode: tempPassword
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating new account:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});


// Get all surveys with status and user responses
router.get('/surveys', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // First check for any surveys that have ended
    const [endedSurveys] = await connection.query(`
      SELECT SURVEY_ID 
      FROM SURVEY 
      WHERE END_DATE <= NOW() 
      AND STATUS = 'ACTIVE' 
      AND RESULTS_SENT = FALSE
    `);

    // Process each ended survey
    for (const survey of endedSurveys) {
      await processSurveyResults(connection, survey.SURVEY_ID);
    }

    // Get active surveys
    const [activeSurveys] = await connection.query(`
      SELECT DISTINCT
        s.SURVEY_ID,
        s.MESSAGE,
        s.ANSWER_1,
        s.ANSWER_2,
        s.ANSWER_3,
        s.ANSWER_4,
        s.END_DATE,
        s.STATUS,
        s.CREATED_BY,
        s.RESULTS_SENT
      FROM SURVEY s
      WHERE s.STATUS = 'ACTIVE'
        AND s.END_DATE > NOW()
      ORDER BY s.END_DATE ASC
    `);

    // Get inactive surveys
    const [inactiveSurveys] = await connection.query(`
      SELECT DISTINCT
        s.SURVEY_ID,
        s.MESSAGE,
        s.ANSWER_1,
        s.ANSWER_2,
        s.ANSWER_3,
        s.ANSWER_4,
        s.END_DATE,
        s.STATUS,
        s.CREATED_BY,
        s.RESULTS_SENT
      FROM SURVEY s
      WHERE s.STATUS = 'INACTIVE'
        OR (s.STATUS = 'ACTIVE' AND s.END_DATE <= NOW())
      ORDER BY s.END_DATE DESC
    `);

    // Get user's responses
    const [responses] = await connection.query(
      'SELECT SURVEY_ID, RESPONSE FROM OWNER_SURVEY_MAP WHERE OWNER_ID = ?',
      [req.userId]
    );

    const userResponses = responses.reduce((acc, curr) => {
      acc[curr.SURVEY_ID] = curr.RESPONSE;
      return acc;
    }, {});

    await connection.commit();
    res.json({ 
      activeSurveys, 
      inactiveSurveys,
      userResponses 
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in surveys endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    connection.release();
  }
});

// Create new survey
router.post('/surveys', verifyToken, verifyBoardMember, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    console.log('Starting survey creation process...');
    await connection.beginTransaction();
    const { message, answers, endDate } = req.body;

    console.log('Survey details:', { 
      messageLength: message?.length,
      answersCount: answers?.length,
      endDate,
      boardMemberId: req.boardMember.MEMBER_ID 
    });

    // Validate end date is in the future
    const now = new Date();
    const surveyEndDate = new Date(endDate);
    if (surveyEndDate <= now) {
      throw new Error('End date must be in the future');
    }

    // Insert survey
    const [result] = await connection.query(
      `INSERT INTO SURVEY (
        MESSAGE,
        ANSWER_1,
        ANSWER_2,
        ANSWER_3,
        ANSWER_4,
        CREATED_BY,
        END_DATE,
        STATUS,
        RESULTS_SENT
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', FALSE)`,
      [
        message,
        answers[0] || null,
        answers[1] || null,
        answers[2] || null,
        answers[3] || null,
        req.boardMember.MEMBER_ID,
        surveyEndDate
      ]
    );

    console.log('Survey inserted with ID:', result.insertId);

    // Get eligible recipients with proper notification preferences
    console.log('Fetching eligible recipients...');
    const [recipients] = await connection.query(`
      SELECT EMAIL, FIRST_NAME, LAST_NAME 
      FROM OWNER
      WHERE NOTIFICATION_PREF_ID IN (1,6,7,8,9,14,15,16,17)
    `);

    console.log('Recipients found:', recipients.length);

    // Send email notifications
    let emailsSent = 0;
    let emailErrors = [];

    for (const recipient of recipients) {
      try {
        console.log('Preparing to send email notification to:', recipient.EMAIL);
        
        console.log('SendGrid API Key present:', !!process.env.SENDGRID_API_KEY);

        const emailData = {
          to: recipient.EMAIL,
          subject: 'New Survey from Summit Ridge HOA',
          template: 'survey',
          context: {
            surveyQuestion: message,
            surveyEndDate: surveyEndDate.toLocaleDateString(),
            surveyUrl: `${process.env.FRONTEND_URL}/surveys/${result.insertId}`,
            preferencesUrl: `${process.env.FRONTEND_URL}/owner-info`
          }
        };

        console.log('Email data prepared:', {
          to: emailData.to,
          subject: emailData.subject,
          template: emailData.template,
          hasContext: !!emailData.context
        });

        await sendEmail(emailData);
        console.log('Email sent successfully to:', recipient.EMAIL);
        emailsSent++;
      } catch (emailError) {
        console.error('Error sending email to:', recipient.EMAIL, {
          error: emailError.message,
          response: emailError.response?.body,
          stack: emailError.stack
        });
        emailErrors.push({
          email: recipient.EMAIL,
          error: emailError.message
        });
      }
    }

    console.log('Email sending complete:', {
      totalRecipients: recipients.length,
      emailsSent,
      emailErrors: emailErrors.length
    });

    await connection.commit();
    console.log('Transaction committed successfully');
    
    res.status(201).json({ 
      message: 'Survey created successfully',
      surveyId: result.insertId,
      emailStats: {
        totalRecipients: recipients.length,
        emailsSent,
        emailErrors: emailErrors.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in survey route:', {
      error: error.message,
      stack: error.stack
    });
    res.status(400).json({ error: error.message || 'Error creating survey' });
  } finally {
    connection.release();
  }
});

// Submit survey response
router.post('/surveys/:id/responses', verifyToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { answerNumber } = req.body;
    const surveyId = req.params.id;

    // Check if survey is still active
    const [survey] = await connection.query(
      'SELECT STATUS, END_DATE FROM SURVEY WHERE SURVEY_ID = ?',
      [surveyId]
    );

    if (!survey.length) {
      throw new Error('Survey not found');
    }

    if (survey[0].STATUS !== 'ACTIVE' || new Date(survey[0].END_DATE) <= new Date()) {
      throw new Error('Survey is no longer active');
    }

    // Check if user already responded
    const [existing] = await connection.query(
      'SELECT * FROM OWNER_SURVEY_MAP WHERE OWNER_ID = ? AND SURVEY_ID = ?',
      [req.userId, surveyId]
    );

    if (existing.length > 0) {
      throw new Error('You have already responded to this survey');
    }

    // Submit response
    await connection.query(
      'INSERT INTO OWNER_SURVEY_MAP (OWNER_ID, SURVEY_ID, RESPONSE, RESPONSE_DATE) VALUES (?, ?, ?, NOW())',
      [req.userId, surveyId, answerNumber]
    );

    await connection.commit();
    res.json({ message: 'Response submitted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting survey response:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Get survey results
router.get('/surveys/:id/results', verifyToken, async (req, res) => {
  try {
    const surveyId = req.params.id;

    // Get total responses
    const [totalCount] = await pool.query(
      'SELECT COUNT(*) as total FROM OWNER_SURVEY_MAP WHERE SURVEY_ID = ?',
      [surveyId]
    );

    const total = totalCount[0].total || 0;

    if (total === 0) {
      return res.json({
        totalResponses: 0,
        answers: {}
      });
    }

    // Get response counts
    const [responses] = await pool.query(
      `SELECT 
        RESPONSE as answerNumber,
        COUNT(*) as count
      FROM OWNER_SURVEY_MAP 
      WHERE SURVEY_ID = ?
      GROUP BY RESPONSE
      ORDER BY RESPONSE`,
      [surveyId]
    );

    // Format results
    const answers = responses.reduce((acc, curr) => {
      acc[curr.answerNumber] = {
        count: curr.count,
        percentage: ((curr.count / total) * 100)
      };
      return acc;
    }, {});

    res.json({
      totalResponses: total,
      answers
    });
  } catch (error) {
    console.error('Error fetching survey results:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Contact Page submission
router.post('/contact/submit', async (req, res) => {
  try {
    const { subject, message, guestInfo } = req.body;
    
    // Get active board members excluding system user (999999999)
    const [boardMembers] = await pool.execute(`
      SELECT DISTINCT o.OWNER_ID 
      FROM OWNER o
      JOIN OWNER_BOARD_MEMBER_MAP obm ON o.OWNER_ID = obm.OWNER_ID 
      WHERE obm.END_DATE IS NULL 
      AND o.OWNER_ID != 999999999
    `);

    if (boardMembers.length === 0) {
      return res.status(500).json({ error: 'No active board members found' });
    }

    // Format the message with guest info
    const formattedMessage = `
      Contact Form Submission

      From: ${guestInfo.name}
      Email: ${guestInfo.email}
      Subject: ${subject}

      Message:
      ${message}

      Submitted: ${new Date().toLocaleString()}
          `.trim();

    // Insert the message once
    const [messageResult] = await pool.execute(
      'INSERT INTO MESSAGE (MESSAGE, CREATED, SENDER_ID) VALUES (?, NOW(), 999999999)',
      [formattedMessage]
    );

    const messageId = messageResult.insertId;

    // Create message mappings for each board member
    const messageMapValues = boardMembers.map(member => 
      [member.OWNER_ID, messageId, false]
    ).join('),(');

    await pool.execute(`
      INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID, IS_READ) 
      VALUES (${messageMapValues})
    `);

    res.status(201).json({ success: true });

  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/verify-email-config', async (req, res) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }
    
    const testMsg = {
      to: 'test@example.com', // Replace with your test email
      from: 'TheSummitRidgeHOA@proton.me',
      subject: 'SendGrid Test',
      text: 'This is a test email to verify SendGrid configuration.',
      html: '<p>This is a test email to verify SendGrid configuration.</p>'
    };

    await sgMail.send(testMsg);
    res.json({ 
      status: 'success', 
      message: 'SendGrid is properly configured',
      sender: 'TheSummitRidgeHOA@proton.me'
    });
  } catch (error) {
    console.error('SendGrid verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'SendGrid configuration error',
      error: error.message,
      response: error.response?.body
    });
  }
});

module.exports = router;