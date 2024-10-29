const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const pool = require('../config/database');
const { createPasswordHash } = require('../utils/auth');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class PasswordResetService {
  static generateTemporaryPassword() {
    // Generate a secure random password that meets our requirements
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'A'; // Uppercase
    password += 'a'; // Lowercase
    password += '1'; // Number
    password += '!'; // Special char
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  static async sendPasswordResetEmail(email, tempPassword) {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Summit Ridge HOA - Temporary Password',
      text: `Your temporary password is: ${tempPassword}\n\nPlease log in with this password. You will be required to change it upon login.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Summit Ridge HOA - Password Reset</h2>
          <p>A temporary password has been generated for your account.</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p>Please log in with this temporary password. For security reasons, you will be required to change it immediately upon logging in.</p>
          <p style="color: #666; font-size: 0.9em;">
            If you did not request this password reset, please contact support immediately.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
  }

  static async resetPassword(email) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if user exists
      const [users] = await connection.query(
        'SELECT OWNER_ID FROM OWNER WHERE EMAIL = ?',
        [email]
      );

      if (users.length === 0) {
        throw new Error('User not found');
      }

      // Generate and hash temporary password
      const tempPassword = this.generateTemporaryPassword();
      const hashedPassword = await createPasswordHash(tempPassword);

      // Update user's password and mark it as temporary
      await connection.query(
        'UPDATE OWNER SET PASSWORD = ?, IS_TEMPORARY_PASSWORD = 1 WHERE EMAIL = ?',
        [hashedPassword, email]
      );

      // Send email with temporary password
      await this.sendPasswordResetEmail(email, tempPassword);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = PasswordResetService;