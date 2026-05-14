#!/usr/bin/env npx tsx
/**
 * Test script: send a verification email to a given address.
 *
 * Usage:
 *   npm run email:test -- user@example.com
 *   OR
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

import 'dotenv/config';
import { sendVerificationEmail } from '#src/services/email.service.ts';

const email = process.argv[2];

if (!email) {
  console.error('\nUsage: npm run email:test -- <email>');
  console.error('Example: npm run email:test -- test@example.com\n');
  process.exit(1);
}

// Print email configuration status
console.log('\n=== Email Configuration Status ===');
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || '587';
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const emailFrom = process.env.EMAIL_FROM;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log(`SMTP_HOST: ${smtpHost || '(not set)'}`);
console.log(`SMTP_PORT: ${smtpPort}`);
console.log(`SMTP_USER: ${smtpUser || '(not set)'}`);
console.log(`SMTP_PASS: ${smtpPass ? 'configured (' + smtpPass.length + ' chars)' : '(not set)'}`);
console.log(`EMAIL_FROM: ${emailFrom || '(not set)'}`);
console.log(`FRONTEND_URL: ${frontendUrl}`);
console.log('===================================\n');

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn('⚠️  Warning: SMTP credentials not fully configured.');
  console.warn('   Email will be printed to console instead of sent.\n');
}

// Use a test token so the link is valid but won't actually verify anyone
const testToken = 'test_token_' + Math.random().toString(36).slice(2);
const verifyUrl = `${frontendUrl}/auth/verify-email?token=${testToken}`;

console.log(`📧 Sending verification email to: ${email}`);
console.log(`🔗 Verify URL: ${verifyUrl}\n`);

const result = await sendVerificationEmail(email, verifyUrl);

console.log('\n=== Email Send Result ===');
if (result.success) {
  console.log(`✓ Status: SUCCESS`);
  console.log(`  Provider: ${result.provider}`);
  console.log(`  Message ID: ${result.messageId}`);
  console.log(`  Duration: ${result.durationMs}ms`);
  console.log('==========================\n');
  process.exit(0);
} else {
  console.error(`✗ Status: FAILED`);
  console.error(`  Provider: ${result.provider}`);
  console.error(`  Error: ${result.error}`);
  console.error(`  Duration: ${result.durationMs}ms`);
  console.error('==========================\n');
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Check that SMTP_HOST, SMTP_USER, and SMTP_PASS are set in server/.env');
  console.error('   2. For Gmail, use an App Password (16 chars, no spaces)');
  console.error('   3. Generate at: https://myaccount.google.com/apppasswords');
  console.error('   4. Verify SMTP_HOST=smtp.gmail.com and SMTP_PORT=587\n');
  process.exit(1);
}