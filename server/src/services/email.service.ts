import transporter, { EMAIL_FROM } from '#src/config/nodemailer.config.ts';

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

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: toEmail,
    subject,
    html,
    text,
  });
}
