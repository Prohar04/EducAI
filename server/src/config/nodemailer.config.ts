import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // Google App Password (16-char, no spaces)
  },
});

// Default "from" address for all outgoing emails
export const EMAIL_FROM =
  process.env.EMAIL_FROM || `EducAI <${process.env.EMAIL_USER}>`;

export default transporter;
