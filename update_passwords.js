const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

const saltRounds = 10;
const defaultPassword = 'Pas$w0rd1!';

async function updatePasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    await connection.query('UPDATE OWNER SET PASSWORD_HASH = ?, IS_TEMPORARY_PASSWORD = TRUE', [hashedPassword]);
    console.log('All passwords have been updated successfully.');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await connection.end();
  }
}

updatePasswords();