#!/usr/bin/env npx tsx
/**
 * Test script: send a verification email to a given address.
 *
 * Usage:
 *   npx tsx scripts/send-test-verification-email.ts user@example.com
 *
 * Environment variables required (from server/.env):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM, FRONTEND_URL
 *
 * Set EMAIL_PROVIDER=console to print the verification link to stdout
 * without actually sending an email (useful when SMTP_PASS is not set).
 *
 * For Gmail:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_SECURE=false
 *   SMTP_USER=support.educai@gmail.com
 *   SMTP_PASS=<your-16-char-app-password>
 */

import { sendVerificationEmail } from '#src/services/email.service.ts';

const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/send-test-verification-email.ts <email>');
  process.exit(1);
}

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Use a test token so the link is valid but won't actually verify anyone
const testToken = 'test_token_' + Math.random().toString(36).slice(2);
const verifyUrl = `${frontendUrl}/auth/verify-email?token=${testToken}`;

console.log(`[test] Sending verification email to ${email}`);
console.log(`[test] Verify URL: ${verifyUrl}`);

const result = await sendVerificationEmail(email, verifyUrl);

if (result.success) {
  console.log(`[test] Email sent successfully via ${result.provider} | messageId: ${result.messageId}`);
} else {
  console.error(`[test] Email send failed via ${result.provider} | error: ${result.error}`);
  process.exit(1);
}