import nodemailer from 'nodemailer';

// Support two modes:
// 1. Gmail via smtp.gmail.com:587 with SMTP_USER + SMTP_PASS (App Password)
// 2. Custom SMTP via SMTP_HOST + SMTP_PORT + SMTP_SECURE + SMTP_USER + SMTP_PASS

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || '587', 10);
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
console.log('\n[nodemailer] Email configuration status:');
console.log(`  SMTP provider configured: ${!!(host && user && pass) || !!(user && pass) ? 'yes' : 'no'}`);
console.log(`  SMTP host: ${host || '(not set)'}`);
console.log(`  SMTP port: ${port}`);
console.log(`  SMTP user: ${user || '(not set)'}`);
console.log(`  SMTP_PASS configured: ${!!pass ? 'yes' : 'no'}`);
console.log(`  EMAIL_FROM: ${emailFrom || '(not set)'}`);
console.log(`  FRONTEND_URL: ${frontendUrl || '(not set)'}`);

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
    console.error(`[nodemailer] ⚠️  PRODUCTION ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('[nodemailer] Email verification will fail. Signup and password reset will not work.');
  }
}

if (host && user && pass) {
  // Custom SMTP — also covers smtp.gmail.com (the recommended path)
  transporter = nodemailer.createTransport({
    host,
    port,
    secure, // false for port 587 (STARTTLS), true for 465 (SSL)
    auth: { user, pass },
  });
  EMAIL_CONFIGURED = true;
  console.log(`[nodemailer] ✓ Using custom SMTP: ${host}:${port} (user=${user})\n`);
} else if (user && pass) {
  // Fallback: Gmail via "service" shorthand (EMAIL_USER + EMAIL_PASS)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  EMAIL_CONFIGURED = true;
  console.log('[nodemailer] ✓ Using Gmail service transport\n');
} else {
  // No credentials — use jsonTransport (dev/test stub; does NOT send real email)
  console.warn(
    '[nodemailer] ⚠  No SMTP credentials found (SMTP_HOST + SMTP_USER + SMTP_PASS).' +
    ' Email sending is DISABLED. Set EMAIL_PROVIDER=console to suppress this in development.\n',
  );
  transporter = nodemailer.createTransport({ jsonTransport: true });
  // EMAIL_CONFIGURED stays false
}

// Default "from" address for all outgoing emails
export const EMAIL_FROM = emailFrom || `EducAI <${user || 'noreply@example.com'}>`;

export default transporter;
