const nodemailer = require('nodemailer');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services or SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error; // Re-throw to allow calling functions to handle
  }
}

module.exports = {
  sendEmail,
};
