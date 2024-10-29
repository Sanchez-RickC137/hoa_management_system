// tests/emailTest.js
require('dotenv').config();
const { sendEmail } = require('../utils/emailUtils');

const testEmail = async () => {
  try {
    await sendEmail({
      to: 'jprangers365@gmail.com', // Your test email
      subject: 'Test Email - Summit Ridge HOA',
      template: 'payment',
      context: {
        amount: '100.00',
        date: new Date(),
        paymentMethod: 'Visa ending in 1234',
        confirmationNumber: '12345',
        paymentHistoryUrl: 'http://localhost:3000/payments'
      },
      bypassPreferences: true
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Test email failed:', error);
  }
  process.exit();
};

testEmail();