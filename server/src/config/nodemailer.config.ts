import nodemailer from 'nodemailer';

// Support two modes:
// 1. Gmail via smtp.gmail.com:587 with SMTP_USER + SMTP_PASS (App Password)
// 2. Custom SMTP via SMTP_HOST + SMTP_PORT + SMTP_SECURE + SMTP_USER + SMTP_PASS

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

// EMAIL_CONFIGURED is true only when real SMTP credentials are present.
// When false the transporter is a no-op jsonTransport; sendMail() will appear
// to succeed but nothing is sent.  email.service.ts uses this to fail fast
// in production rather than silently dropping emails.
export let EMAIL_CONFIGURED = false;

let transporter: nodemailer.Transporter;

if (host && user && pass) {
  // Custom SMTP — also covers smtp.gmail.com (the recommended path)
  transporter = nodemailer.createTransport({
    host,
    port,
    secure, // false for port 587 (STARTTLS), true for 465 (SSL)
    auth: { user, pass },
  });
  EMAIL_CONFIGURED = true;
  console.log(`[nodemailer] Using custom SMTP: ${host}:${port} (user=${user})`);
} else if (user && pass) {
  // Fallback: Gmail via "service" shorthand (EMAIL_USER + EMAIL_PASS)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  EMAIL_CONFIGURED = true;
  console.log('[nodemailer] Using Gmail service transport');
} else {
  // No credentials — use jsonTransport (dev/test stub; does NOT send real email)
  console.warn(
    '[nodemailer] ⚠  No SMTP credentials found (SMTP_HOST + SMTP_USER + SMTP_PASS).' +
    ' Email sending is DISABLED. Set EMAIL_PROVIDER=console to suppress this in development.',
  );
  transporter = nodemailer.createTransport({ jsonTransport: true });
  // EMAIL_CONFIGURED stays false
}

// Default "from" address for all outgoing emails
export const EMAIL_FROM = process.env.EMAIL_FROM || `EducAI <${user || 'noreply@example.com'}>`;

export default transporter;
