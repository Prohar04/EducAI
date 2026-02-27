import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.resend.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE !== 'false', // true by default for port 465
  auth: {
    user: process.env.EMAIL_USER || 'resend', // Resend always uses 'resend' as username
    pass: process.env.EMAIL_PASS, // Resend API key (re_xxx)
  },
});

// Default "from" address for all outgoing emails
export const EMAIL_FROM =
  process.env.EMAIL_FROM || 'EducAI <noreply@educai.is-a.dev>';

export default transporter;
