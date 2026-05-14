import nodemailer from 'nodemailer';

// Support two modes:
// 1. Gmail via service: 'gmail' with EMAIL_USER + EMAIL_PASS (legacy, simpler)
// 2. Custom SMTP via SMTP_HOST + SMTP_PORT + SMTP_SECURE + SMTP_USER + SMTP_PASS

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

let transporter: nodemailer.Transporter;

if (host) {
  // Custom SMTP (supports Gmail via smtp.gmail.com:587 or any provider)
  transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true for port 465, false for 587 (STARTTLS)
    auth: { user, pass },
  });
  console.log(`[nodemailer] Using custom SMTP: ${host}:${port}`);
} else if (user && pass) {
  // Fallback: Gmail via service (EMAIL_USER + EMAIL_PASS)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  console.log('[nodemailer] Using Gmail service');
} else {
  console.warn('[nodemailer] No SMTP credentials found — email sending will be disabled');
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

// Default "from" address for all outgoing emails
export const EMAIL_FROM = process.env.EMAIL_FROM || `EducAI <${user || 'noreply@example.com'}>`;

export default transporter;
