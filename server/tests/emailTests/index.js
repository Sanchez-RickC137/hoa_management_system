require('dotenv').config();
const { testAnnouncement } = require('./announcementTest');
const { testMessage } = require('./messageTest');
const { testViolation } = require('./violationTest');
const { testAssessment } = require('./assessmentTest');
const { testPayment } = require('./paymentTest');
const { testAccountCharge } = require('./accountChargeTest');

const TEST_USER = {
  OWNER_ID: '100730318',
  EMAIL: 'SummitRidgeUser@proton.me',
  ACCOUNT_ID: '1' // Replace with actual account ID
};

const runAllTests = async () => {
  try {
    console.log('\n=== Starting Email Test Suite ===\n');

    console.log('Running Announcement Test...');
    await testAnnouncement(TEST_USER);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\nRunning Message Test...');
    await testMessage(TEST_USER);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\nRunning Violation Test...');
    await testViolation(TEST_USER);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\nRunning Assessment Test...');
    await testAssessment(TEST_USER);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\nRunning Payment Test...');
    await testPayment(TEST_USER);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\nRunning Account Charge Test...');
    await testAccountCharge(TEST_USER);

    console.log('\n=== Email Test Suite Complete ===\n');
  } catch (error) {
    console.error('Test suite failed:', error);
  }
};

runAllTests();