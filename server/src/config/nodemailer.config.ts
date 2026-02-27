import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'apikey', // SendGrid always uses 'apikey' as username
    pass: process.env.EMAIL_PASS, // SendGrid API key
  },
});

// Default "from" address for all outgoing emails
export const EMAIL_FROM =
  process.env.EMAIL_FROM || 'EducAI <noreply@educai.com>';

export default transporter;
