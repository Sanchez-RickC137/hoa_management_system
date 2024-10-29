const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config();

const updateCardHashes = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Fetch all cards
    const [rows] = await connection.query('SELECT CARD_ID, CARD_NUMBER_LAST_4 FROM CREDIT_CARDS');

    for (const card of rows) {
      // In a real scenario, you'd need a secure way to access the full card number
      // For this example, we'll create a dummy full number using the last 4 digits
      const dummyFullNumber = `1234567890${card.CARD_NUMBER_LAST_4}`;
      
      // Create hash
      const cardNumberHash = crypto.createHash('sha256').update(dummyFullNumber).digest('hex');

      // Update the card with the new hash
      await connection.query(
        'UPDATE CREDIT_CARDS SET CARD_NUMBER_HASH = ? WHERE CARD_ID = ?',
        [cardNumberHash, card.CARD_ID]
      );

      console.log(`Updated hash for card ending in ${card.CARD_NUMBER_LAST_4}`);
    }

    console.log('All cards updated successfully');
  } catch (error) {
    console.error('Error updating card hashes:', error);
  } finally {
    await connection.end();
  }
};

updateCardHashes();