const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedPaymentData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Get all payments without card_id
    const [payments] = await connection.query('SELECT * FROM PAYMENT WHERE CARD_ID IS NULL');

    for (const payment of payments) {
      // Get a random card for the account
      const [cards] = await connection.query('SELECT CARD_ID FROM CREDIT_CARDS WHERE ACCOUNT_ID = ? ORDER BY RAND() LIMIT 1', [payment.ACCOUNT_ID]);
      
      if (cards.length > 0) {
        const cardId = cards[0].CARD_ID;
        await connection.query('UPDATE PAYMENT SET CARD_ID = ? WHERE PAYMENT_ID = ?', [cardId, payment.PAYMENT_ID]);
        console.log(`Updated payment ${payment.PAYMENT_ID} with card ${cardId}`);
      } else {
        console.log(`No card found for payment ${payment.PAYMENT_ID}`);
      }
    }

    console.log('Seeding completed');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await connection.end();
  }
}

seedPaymentData();