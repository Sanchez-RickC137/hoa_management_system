require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const apiRoutes = require('./routes/apiRoutes');
const { scheduleJob } = require('node-schedule');
const { processSurveyResults } = require('./utils/surveyUtils');
const helmet = require('helmet');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Schedule survey check to run at midnight (00:00) every day
scheduleJob('0 0 * * *', async () => {
  console.log('Running daily survey status check:', new Date().toISOString());
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [endedSurveys] = await connection.query(`
      SELECT SURVEY_ID 
      FROM SURVEY 
      WHERE END_DATE <= CURRENT_DATE()
      AND STATUS = 'ACTIVE' 
      AND RESULTS_SENT = FALSE
    `);

    if (endedSurveys.length > 0) {
      console.log(`Found ${endedSurveys.length} surveys to process`);
      for (const survey of endedSurveys) {
        await processSurveyResults(connection, survey.SURVEY_ID);
      }
    }

    await connection.commit();
    console.log('Daily survey check completed');
  } catch (error) {
    await connection.rollback();
    console.error('Error in daily survey check:', error);
  } finally {
    connection.release();
  }
});

// Schedule yearly assessment job to run on January 1st at 00:01
scheduleJob('1 0 1 1 *', async () => {
  console.log('Running yearly assessment processing:', new Date().toISOString());
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get current year's assessment rate
    const [currentRate] = await connection.query(`
      SELECT RATE_ID, AMOUNT 
      FROM ASSESSMENT_RATE 
      WHERE ASSESSMENT_YEAR = YEAR(CURRENT_DATE())
      AND IS_YEARLY_ASSESSMENT = 1
    `);

    if (!currentRate.length) {
      throw new Error('No yearly assessment rate found for current year');
    }

    console.log(`Using assessment rate: ${currentRate[0].AMOUNT} (ID: ${currentRate[0].RATE_ID})`);

    // Get assessment type ID for regular assessment
    const [assessmentType] = await connection.query(`
      SELECT TYPE_ID 
      FROM ASSESSMENT_TYPE 
      WHERE ASSESSMENT_DESCRIPTION = 'Regular Assessment'
    `);

    if (!assessmentType.length) {
      throw new Error('Regular Assessment type not found');
    }

    // Get all active accounts with owner notification preferences
    const [activeAccounts] = await connection.query(`
      SELECT DISTINCT
        a.ACCOUNT_ID,
        a.BALANCE,
        a.OWNER_ID,
        a.PROPERTY_ID,
        o.EMAIL,
        o.FIRST_NAME,
        o.LAST_NAME,
        o.NOTIFICATION_PREF_ID,
        p.UNIT,
        p.STREET
      FROM ACCOUNT a
      JOIN PROPERTY_OWNER_MAP pom ON 
        a.PROPERTY_ID = pom.PROPERTY_ID AND 
        a.OWNER_ID = pom.OWNER_ID
      JOIN OWNER o ON a.OWNER_ID = o.OWNER_ID
      JOIN PROPERTY p ON a.PROPERTY_ID = p.PROP_ID
      WHERE pom.SELL_DATE IS NULL
    `);

    console.log(`Processing yearly assessments for ${activeAccounts.length} accounts`);

    // Track processing stats
    const stats = {
      processed: 0,
      emailsSent: 0,
      errors: []
    };

    // Process each account
    for (const account of activeAccounts) {
      try {
        const newBalance = account.BALANCE + currentRate[0].AMOUNT;

        // Create account charge
        const [chargeResult] = await connection.query(`
          INSERT INTO ACCOUNT_CHARGE (
            ACCOUNT_ID,
            CHARGE_TYPE,
            PAYMENT_DUE_DATE,
            ASSESS_DATE,
            RATE_ID,
            ASSESS_TYPE_ID
          ) VALUES (
            ?,
            'ASSESSMENT',
            DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY),
            CURRENT_DATE(),
            ?,
            ?
          )
        `, [account.ACCOUNT_ID, currentRate[0].RATE_ID, assessmentType[0].TYPE_ID]);

        console.log(`Created charge for account ${account.ACCOUNT_ID}`);

        // Update account balance
        await connection.query(
          'UPDATE ACCOUNT SET BALANCE = BALANCE + ? WHERE ACCOUNT_ID = ?',
          [currentRate[0].AMOUNT, account.ACCOUNT_ID]
        );

        // Create system message notification
        const [messageResult] = await connection.query(`
          INSERT INTO MESSAGE (
            SENDER_ID,
            RECEIVER_ID,
            MESSAGE,
            CREATED
          ) VALUES (
            999999999,
            ?,
            ?,
            CURRENT_TIMESTAMP
          )
        `, [
          account.OWNER_ID,
          `Your yearly HOA assessment of $${currentRate[0].AMOUNT.toFixed(2)} has been applied to your account. ` +
          `Payment is due within 30 days. Current balance: $${newBalance.toFixed(2)}`
        ]);

        // Create message mapping
        await connection.query(`
          INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID)
          VALUES (?, ?)
        `, [account.OWNER_ID, messageResult.insertId]);

        // Send email if owner has appropriate notification preferences
        if (account.NOTIFICATION_PREF_ID && [1,3,5,7,9,11,13,15,17].includes(account.NOTIFICATION_PREF_ID)) {
          await sendEmail({
            to: account.EMAIL,
            subject: 'Yearly HOA Assessment - Summit Ridge HOA',
            template: 'assessment',
            context: {
              recipientName: `${account.FIRST_NAME} ${account.LAST_NAME}`,
              assessmentType: 'Yearly Assessment',
              amount: currentRate[0].AMOUNT.toFixed(2),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              accountUrl: `${process.env.FRONTEND_URL}/payments`,
              propertyAddress: `${account.UNIT} ${account.STREET}`
            }
          });
          stats.emailsSent++;
          console.log(`Assessment notification sent to ${account.EMAIL}`);
        } else {
          console.log(`Skipping email for account ${account.ACCOUNT_ID} - notifications not enabled`);
        }

        stats.processed++;
      } catch (error) {
        console.error(`Error processing account ${account.ACCOUNT_ID}:`, error);
        stats.errors.push({
          accountId: account.ACCOUNT_ID,
          error: error.message
        });
        // Continue with next account instead of failing entire batch
      }
    }

    await connection.commit();
    console.log('Yearly assessment processing completed:', {
      totalAccounts: activeAccounts.length,
      processed: stats.processed,
      emailsSent: stats.emailsSent,
      errors: stats.errors.length
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error processing yearly assessments:', error);
  } finally {
    connection.release();
  }
});

// Schedule announcement check to run at midnight (00:00) every day
scheduleJob('0 0 * * *', async () => {
  console.log('Running daily announcement status check:', new Date().toISOString());
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Find and publish scheduled announcements that are due
    const [scheduledAnnouncements] = await connection.query(`
      SELECT ANNOUNCEMENT_ID, TITLE
      FROM ANNOUNCEMENT_NEWS
      WHERE PUBLISH_DATE <= CURRENT_TIMESTAMP()
      AND STATUS = 'SCHEDULED'
    `);

    if (scheduledAnnouncements.length > 0) {
      console.log(`Found ${scheduledAnnouncements.length} announcements to publish`);
      
      // Update all found announcements to published status
      await connection.query(`
        UPDATE ANNOUNCEMENT_NEWS
        SET STATUS = 'PUBLISHED'
        WHERE ANNOUNCEMENT_ID IN (?)
      `, [scheduledAnnouncements.map(a => a.ANNOUNCEMENT_ID)]);

      // Log the published announcements
      scheduledAnnouncements.forEach(announcement => {
        console.log(`Published announcement: ${announcement.TITLE} (ID: ${announcement.ANNOUNCEMENT_ID})`);
      });
    }

    await connection.commit();
    console.log('Daily announcement check completed');
  } catch (error) {
    await connection.rollback();
    console.error('Error in daily announcement check:', error);
  } finally {
    connection.release();
  }
});

// Run voting rights check daily at midnight
scheduleJob('0 0 * * *', async () => {
  console.log('Running scheduled voting rights check...');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Suspend voting rights for past due accounts
    const [pastDueAccounts] = await connection.query(`
      SELECT DISTINCT a.ACCOUNT_ID, a.OWNER_ID, a.BALANCE,
        p.UNIT, p.STREET,
        o.FIRST_NAME, o.LAST_NAME, o.VOTING_RIGHTS
      FROM ACCOUNT a
      JOIN PROPERTY p ON a.PROPERTY_ID = p.PROP_ID
      JOIN OWNER o ON a.OWNER_ID = o.OWNER_ID
      WHERE a.BALANCE > 0 
      AND EXISTS (
        SELECT 1 
        FROM ACCOUNT_CHARGE ac 
        WHERE ac.ACCOUNT_ID = a.ACCOUNT_ID 
        AND ac.PAYMENT_DUE_DATE < CURRENT_DATE
      )
      AND o.VOTING_RIGHTS = '1'`);

    for (const account of pastDueAccounts) {
      await connection.query(
        'UPDATE OWNER SET VOTING_RIGHTS = 0 WHERE OWNER_ID = ?',
        [account.OWNER_ID]
      );

      const message = `Your voting rights have been suspended due to past due balance on your account for ${account.UNIT} ${account.STREET}.\n\n` +
        `Current Balance: $${account.BALANCE}\n\n` +
        `Please log in to make a payment and restore your voting rights.`;

      const [messageResult] = await connection.query(
        'INSERT INTO MESSAGE (SENDER_ID, RECEIVER_ID, MESSAGE, CREATED) VALUES (?, ?, ?, NOW())',
        [999999999, account.OWNER_ID, message]
      );

      await connection.query(
        'INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID) VALUES (?, ?)',
        [account.OWNER_ID, messageResult.insertId]
      );
    }

    // 2. Restore voting rights for current accounts
    const [accountsToClear] = await connection.query(`
      SELECT DISTINCT a.OWNER_ID, a.ACCOUNT_ID,
        p.UNIT, p.STREET
      FROM ACCOUNT a
      JOIN PROPERTY p ON a.PROPERTY_ID = p.PROP_ID
      JOIN OWNER o ON a.OWNER_ID = o.OWNER_ID
      WHERE o.VOTING_RIGHTS = 0
      AND (
        a.BALANCE = 0
        OR NOT EXISTS (
          SELECT 1 
          FROM ACCOUNT_CHARGE ac 
          WHERE ac.ACCOUNT_ID = a.ACCOUNT_ID 
          AND ac.PAYMENT_DUE_DATE < CURRENT_DATE
        )
      )`);

    for (const account of accountsToClear) {
      await connection.query(
        'UPDATE OWNER SET VOTING_RIGHTS = 1 WHERE OWNER_ID = ?',
        [account.OWNER_ID]
      );

      const message = `Your voting rights have been restored. Your account for ${account.UNIT} ${account.STREET} is now current.`;

      const [messageResult] = await connection.query(
        'INSERT INTO MESSAGE (SENDER_ID, RECEIVER_ID, MESSAGE, CREATED) VALUES (?, ?, ?, NOW())',
        [999999999, account.OWNER_ID, message]
      );

      await connection.query(
        'INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID) VALUES (?, ?)',
        [account.OWNER_ID, messageResult.insertId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Error in scheduled voting rights update:', error);
  } finally {
    connection.release();
  }
});

// Run past due reminders weekly on Monday at 9am
scheduleJob('0 9 * * 1', async () => {
  console.log('Running past due reminders...');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get past due accounts that haven't received a reminder in the last 7 days
    // Include notification preferences in the query
    const [pastDueAccounts] = await connection.query(`
      SELECT DISTINCT 
        a.ACCOUNT_ID, 
        a.OWNER_ID, 
        a.BALANCE,
        p.UNIT, 
        p.STREET,
        o.FIRST_NAME, 
        o.LAST_NAME,
        o.EMAIL,
        o.NOTIFICATION_PREF_ID
      FROM ACCOUNT a
      JOIN PROPERTY p ON a.PROPERTY_ID = p.PROP_ID
      JOIN OWNER o ON a.OWNER_ID = o.OWNER_ID
      WHERE a.BALANCE > 0 
      AND EXISTS (
        SELECT 1 
        FROM ACCOUNT_CHARGE ac 
        WHERE ac.ACCOUNT_ID = a.ACCOUNT_ID 
        AND ac.PAYMENT_DUE_DATE < CURRENT_DATE
      )
      AND NOT EXISTS (
        SELECT 1 
        FROM MESSAGE m
        WHERE m.SENDER_ID = 999999999 
        AND m.RECEIVER_ID = a.OWNER_ID
        AND m.MESSAGE LIKE '%past due reminder%'
        AND m.CREATED > DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
      )`);

    console.log(`Found ${pastDueAccounts.length} past due accounts to process`);

    for (const account of pastDueAccounts) {
      try {
        // Always create the system message
        const reminderMessage = `Past due reminder: Your account for ${account.UNIT} ${account.STREET} ` +
          `has an outstanding balance of $${account.BALANCE}.\n\n` +
          `Please log in to make a payment or contact the board if you need to make payment arrangements.`;

        const [reminderResult] = await connection.query(
          'INSERT INTO MESSAGE (SENDER_ID, RECEIVER_ID, MESSAGE, CREATED) VALUES (?, ?, ?, NOW())',
          [999999999, account.OWNER_ID, reminderMessage]
        );

        await connection.query(
          'INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID) VALUES (?, ?)',
          [account.OWNER_ID, reminderResult.insertId]
        );

        // Send email notification if owner has appropriate preferences
        if (account.NOTIFICATION_PREF_ID in [1,3,5,7,9,11,13,15,17]) { // IDs that have CHARGES_ENABLED
          await sendEmail({
            to: account.EMAIL,
            subject: 'Past Due Balance Reminder - Summit Ridge HOA',
            template: 'charge',
            context: {
              recipientName: `${account.FIRST_NAME} ${account.LAST_NAME}`,
              propertyAddress: `${account.UNIT} ${account.STREET}`,
              amount: account.BALANCE.toFixed(2),
              accountUrl: `${process.env.FRONTEND_URL}/payments`
            }
          });
          console.log(`Past due reminder email sent to ${account.EMAIL}`);
        }

      } catch (error) {
        console.error(`Error processing reminder for account ${account.ACCOUNT_ID}:`, error);
        // Continue with next account instead of failing entire batch
      }
    }

    await connection.commit();
    console.log('Past due reminders completed');
  } catch (error) {
    await connection.rollback();
    console.error('Error sending past due reminders:', error);
  } finally {
    connection.release();
  }
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));


app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));