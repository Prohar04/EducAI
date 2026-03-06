import transporter, { EMAIL_FROM } from '#src/config/nodemailer.config.ts';

// EMAIL_PROVIDER=console  → print link to stdout (dev default when no creds configured)
// EMAIL_PROVIDER=smtp|gmail → send via nodemailer
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp';
const IS_DEV = process.env.NODE_ENV !== 'production';

async function sendMail(opts: { to: string; subject: string; html: string; text: string }): Promise<void> {
  if (EMAIL_PROVIDER === 'console') {
    console.log(`\n[EMAIL → ${opts.to}] ${opts.subject}\n${opts.text}\n`);
    return;
  }
  try {
    await transporter.sendMail({ from: EMAIL_FROM, ...opts });
  } catch (err) {
    if (IS_DEV) {
      // In development, fall back to console so signup/reset never fail locally
      console.error('[Email delivery failed — printing to console instead]', (err as Error).message);
      console.log(`\n[EMAIL → ${opts.to}] ${opts.subject}\n${opts.text}\n`);
    } else {
      throw err; // re-throw in production so callers handle it
    }
  }
}

export async function sendVerificationEmail(
  toEmail: string,
  verifyUrl: string
): Promise<void> {
  const subject = 'Verify your EducAI email';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111;">Verify Your Email</h2>
      <p>Thanks for creating an EducAI account! Please verify your email address to get started.</p>
      <p>Click the button below to verify. This link will expire in 24 hours.</p>
      <a
        href="${verifyUrl}"
        style="display: inline-block; padding: 12px 24px; margin: 16px 0;
               background-color: #4f46e5; color: #fff; text-decoration: none;
               border-radius: 6px; font-weight: bold;"
      >
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px;">
        If you didn&rsquo;t create this account, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">EducAI &mdash; Your AI-powered learning platform</p>
    </div>
  `;

  const text = `Verify your EducAI email\n\nClick the link below to verify your email (expires in 24 hours):\n${verifyUrl}\n\nIf you didn't create this account, you can safely ignore this email.`;

  await sendMail({ to: toEmail, subject, html, text });
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string
): Promise<void> {
  const subject = 'Reset your EducAI password';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111;">Reset Your Password</h2>
      <p>You requested a password reset for your EducAI account.</p>
      <p>Click the button below to set a new password. This link will expire in 30 minutes.</p>
      <a
        href="${resetUrl}"
        style="display: inline-block; padding: 12px 24px; margin: 16px 0;
               background-color: #4f46e5; color: #fff; text-decoration: none;
               border-radius: 6px; font-weight: bold;"
      >
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">
        If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">EducAI &mdash; Your AI-powered learning platform</p>
    </div>
  `;

  const text = `Reset your EducAI password\n\nClick the link below to set a new password (expires in 30 minutes):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`;

  await sendMail({ to: toEmail, subject, html, text });
}
