import nodemailer from 'nodemailer';
import logger from './logger.ts';

// Support two modes:
// 1. Gmail via smtp.gmail.com:587 with SMTP_USER + SMTP_PASS (App Password)
// 2. Custom SMTP via SMTP_HOST + SMTP_PORT + SMTP_SECURE + SMTP_USER + SMTP_PASS

const host = process.env.SMTP_HOST;
const rawPort = parseInt(process.env.SMTP_PORT || '587', 10);
const port = Number.isNaN(rawPort) || rawPort < 1 || rawPort > 65535 ? 587 : rawPort;
const secure = process.env.SMTP_SECURE === 'true';
const user = process.env.SMTP_USER || process.env.EMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const frontendUrl = process.env.FRONTEND_URL;
const emailFrom = process.env.EMAIL_FROM;

// EMAIL_CONFIGURED is true only when real SMTP credentials are present.
// When false the transporter is a no-op jsonTransport; sendMail() will appear
// to succeed but nothing is sent.  email.service.ts uses this to fail fast
// in production rather than silently dropping emails.
export let EMAIL_CONFIGURED = false;

let transporter: nodemailer.Transporter;

// ── Startup validation and logging ────────────────────────────────────
logger.info('[nodemailer] Email configuration status', {
  smtpConfigured: !!(host && user && pass) || !!(user && pass),
  smtpHost: host || '(not set)',
  smtpPort: port,
  smtpSecure: secure,
  smtpUser: user || '(not set)',
  smtpPassConfigured: !!pass,
  emailFrom: emailFrom || '(not set)',
  frontendUrl: frontendUrl || '(not set)',
});

// Validate required config in production
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
if (IS_PRODUCTION) {
  const missingVars = [];
  if (!host) missingVars.push('SMTP_HOST');
  if (!user) missingVars.push('SMTP_USER');
  if (!pass) missingVars.push('SMTP_PASS');
  if (!emailFrom) missingVars.push('EMAIL_FROM');
  if (!frontendUrl) missingVars.push('FRONTEND_URL');

  if (missingVars.length > 0) {
    logger.error(`[nodemailer] PRODUCTION: Missing required environment variables: ${missingVars.join(', ')}. Email verification will fail.`);
  }
}

if (host && user && pass) {
  // Custom SMTP — also covers smtp.gmail.com (the recommended path)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transporter = nodemailer.createTransport({
    host,
    port,
    secure, // false for port 587 (STARTTLS), true for 465 (SSL)
    auth: { user, pass },
    family: 4, // Force IPv4 — Render free tier has no outbound IPv6
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  } as any);
  EMAIL_CONFIGURED = true;
  logger.info(`[nodemailer] Using custom SMTP: ${host}:${port}`, { user });
} else if (user && pass) {
  // Fallback: Gmail via "service" shorthand (EMAIL_USER + EMAIL_PASS)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    family: 4, // Force IPv4 — Render free tier has no outbound IPv6
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  } as any);
  EMAIL_CONFIGURED = true;
  logger.info('[nodemailer] Using Gmail service transport');
} else {
  // No credentials — use jsonTransport (dev/test stub; does NOT send real email)
  logger.warn('[nodemailer] No SMTP credentials found (SMTP_HOST + SMTP_USER + SMTP_PASS). Email sending is DISABLED.');
  transporter = nodemailer.createTransport({ jsonTransport: true });
  // EMAIL_CONFIGURED stays false
}

// Default "from" address for all outgoing emails
export const EMAIL_FROM = emailFrom || `EducAI <${user || 'noreply@example.com'}>`;

export default transporter;
