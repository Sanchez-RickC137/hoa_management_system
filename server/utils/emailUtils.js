const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const pool = require('../db');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Register Handlebars helpers
handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

handlebars.registerHelper('formatCurrency', function(amount) {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
});

// Cache for compiled templates
const templateCache = new Map();

const getCompiledTemplate = async (templateName) => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }
  const templatePath = path.join(__dirname, '../emailTemplates', `${templateName}.hbs`);
  const template = await fs.promises.readFile(templatePath, 'utf8');
  const compiled = handlebars.compile(template);
  templateCache.set(templateName, compiled);
  return compiled;
};

const sendEmail = async ({ to, subject, template, context, attachments, bypassPreferences = false }) => {
  try {
    // Only check preferences if not bypassed (useful for testing)
    if (!bypassPreferences) {
      // Get user's notification preferences
      const [userPrefs] = await pool.query(`
        SELECT np.*
        FROM NOTIFICATION_PREFERENCES np
        JOIN OWNER o ON o.NOTIFICATION_PREF_ID = np.PREF_ID
        WHERE o.EMAIL = ?
      `, [to]);

      if (!userPrefs.length || !userPrefs[0].EMAIL_ENABLED) {
        console.log(`Email notifications disabled for ${to}`);
        return;
      }

      // Check specific notification type
      const prefType = getPreferenceType(template);
      if (!shouldSendNotification(userPrefs[0], prefType)) {
        console.log(`${prefType} notifications disabled for ${to}`);
        return;
      }
    }

    const compiledTemplate = await getCompiledTemplate(template);
    const html = compiledTemplate(context);

    const msg = {
      to,
      from: 'TheSummitRidgeHOA@proton.me',
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    // Add attachments if they exist
    if (attachments && attachments.length > 0) {
      msg.attachments = attachments.map(attachment => ({
        content: attachment.content.toString('base64'),
        filename: attachment.filename,
        type: attachment.type || 'application/pdf',
        disposition: 'attachment'
      }));
    }

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error; // Throw during testing
  }
};

const getPreferenceType = (template) => {
  switch (template) {
    case 'message':
      return 'MESSAGES_ENABLED';
    case 'newsDocument':
      return 'NEWS_DOCS_ENABLED';
    case 'payment':
      return 'PAYMENTS_ENABLED';
    case 'charge':
      return 'CHARGES_ENABLED';
    default:
      return null;
  }
};

const shouldSendNotification = (prefs, type) => {
  if (!type) return true; // System messages always send
  return prefs[type] === 1;
};

module.exports = {
  sendEmail,
  handlebars
};