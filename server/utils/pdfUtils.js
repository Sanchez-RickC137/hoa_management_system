const PDFDocument = require('pdfkit');

const generatePDFReceipt = async (paymentData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      // Collect PDF data chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add logo if exists
      // doc.image('path/to/logo.png', 50, 50, { width: 100 });

      // Header
      doc.fontSize(20).text('Summit Ridge HOA', { align: 'center' });
      doc.fontSize(16).text('Payment Receipt', { align: 'center' });
      doc.moveDown();

      // Payment Details
      doc.fontSize(12);
      doc.text(`Date: ${paymentData.date.toLocaleDateString()}`);
      doc.text(`Amount: $${paymentData.amount.toFixed(2)}`);
      doc.text(`Payment Method: ${paymentData.cardType} ending in ${paymentData.last4}`);
      doc.text(`Confirmation Number: #${paymentData.confirmationNumber}`);
      doc.moveDown();

      // Footer
      doc.fontSize(10).text('Thank you for your payment.', { align: 'center' });
      doc.text('This receipt serves as confirmation of your payment to Summit Ridge HOA.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePDFReceipt };