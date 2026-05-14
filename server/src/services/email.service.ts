import transporter, { EMAIL_FROM, EMAIL_CONFIGURED } from '#src/config/nodemailer.config.ts';

// EMAIL_PROVIDER=console  → print link to stdout (dev default when no creds configured)
// EMAIL_PROVIDER=smtp|gmail → send via nodemailer
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp';
const IS_DEV = process.env.NODE_ENV !== 'production';

interface SendMailResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

async function sendMail(opts: { to: string; subject: string; html: string; text: string }): Promise<SendMailResult> {
  // Always-console mode (explicit opt-in via EMAIL_PROVIDER=console)
  if (EMAIL_PROVIDER === 'console') {
    console.log(`\n[EMAIL → ${opts.to}] ${opts.subject}\n${opts.text}\n`);
    return { success: true, provider: 'console', messageId: 'console-log' };
  }

  // Guard: if no real SMTP credentials are configured, fail fast in production
  // rather than silently "succeeding" with jsonTransport (which discards the email).
  if (!EMAIL_CONFIGURED) {
    const msg = 'SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS in environment';
    console.error(`[email] ${msg}`);

    if (IS_DEV) {
      // Dev convenience: print link to console so local testing still works
      console.log(`\n[EMAIL (no-creds dev fallback) → ${opts.to}] ${opts.subject}\n${opts.text}\n`);
      return { success: true, provider: 'console-fallback', messageId: 'no-creds-dev', error: msg };
    }

    // Production: return failure so callers can surface the error to the user
    return { success: false, provider: 'none', error: msg };
  }

  try {
    const info = await transporter.sendMail({ from: EMAIL_FROM, ...opts });
    console.log(`[email] Sent to ${opts.to} | subject: "${opts.subject}" | messageId: ${info.messageId}`);
    return { success: true, provider: EMAIL_PROVIDER, messageId: info.messageId };
  } catch (err) {
    const errorMessage = (err as Error).message;
    console.error(`[email] Failed to send to ${opts.to} | subject: "${opts.subject}" | error: ${errorMessage}`);

    if (IS_DEV) {
      // In development, fall back to console so signup/reset never fail locally
      console.log(`\n[EMAIL (SMTP error fallback) → ${opts.to}] ${opts.subject}\n${opts.text}\n`);
      return { success: true, provider: 'console-fallback', error: errorMessage };
    }

    // In production, propagate so callers can handle it
    return { success: false, provider: EMAIL_PROVIDER, error: errorMessage };
  }
}

export async function sendVerificationEmail(
  toEmail: string,
  verifyUrl: string
): Promise<SendMailResult> {
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

  return sendMail({ to: toEmail, subject, html, text });
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string
): Promise<SendMailResult> {
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

  return sendMail({ to: toEmail, subject, html, text });
}

export interface ScholarshipAlertItem {
  scholarshipTitle: string;
  provider: string | null;
  deadlineDate: string;   // human-readable, e.g. "15 Dec 2026"
  daysLeft: number;
  scholarshipUrl: string | null;
  amount: string | null;
}

export async function sendScholarshipDeadlineAlert(
  toEmail: string,
  userName: string,
  alerts: ScholarshipAlertItem[],
): Promise<void> {
  if (alerts.length === 0) return;

  const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const scholarshipsUrl = `${appUrl}/app/scholarships`;

  const itemRows = alerts
    .map(
      (a) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">
            <strong>${a.scholarshipTitle}</strong>${a.provider ? `<br/><span style="color:#666;font-size:13px;">${a.provider}</span>` : ''}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;white-space:nowrap;">
            ${a.deadlineDate}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;">
            <span style="background:${a.daysLeft <= 7 ? '#fee2e2' : a.daysLeft <= 14 ? '#fef3c7' : '#dcfce7'};
                         color:${a.daysLeft <= 7 ? '#dc2626' : a.daysLeft <= 14 ? '#d97706' : '#16a34a'};
                         border-radius:9999px;padding:2px 10px;font-size:13px;font-weight:600;">
              ${a.daysLeft}d left
            </span>
          </td>
          ${a.scholarshipUrl ? `<td style="padding:12px 8px;border-bottom:1px solid #eee;"><a href="${a.scholarshipUrl}" style="color:#4f46e5;">Apply</a></td>` : '<td style="padding:12px 8px;border-bottom:1px solid #eee;"></td>'}
        </tr>
      `,
    )
    .join('');

  const subject = alerts.length === 1
    ? `Scholarship deadline in ${alerts[0].daysLeft} days — ${alerts[0].scholarshipTitle}`
    : `${alerts.length} scholarship deadlines coming up — EducAI`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#111;">Scholarship Deadline Alert</h2>
      <p>Hi ${userName},</p>
      <p>You have ${alerts.length === 1 ? 'a scholarship deadline' : `${alerts.length} scholarship deadlines`} coming up soon. Don't miss out!</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="text-align:left;padding:10px 8px;font-size:13px;color:#666;">Scholarship</th>
            <th style="text-align:left;padding:10px 8px;font-size:13px;color:#666;">Deadline</th>
            <th style="text-align:center;padding:10px 8px;font-size:13px;color:#666;">Time Left</th>
            <th style="padding:10px 8px;font-size:13px;color:#666;">Link</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <a href="${scholarshipsUrl}"
         style="display:inline-block;padding:12px 24px;margin:16px 0;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
        View All Scholarships
      </a>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#999;font-size:12px;">EducAI &mdash; Your AI-powered study abroad platform</p>
    </div>
  `;

  const textLines = alerts.map((a) => `• ${a.scholarshipTitle} (${a.provider ?? 'Unknown'}) — deadline ${a.deadlineDate}, ${a.daysLeft} days left`);
  const text = `Scholarship Deadline Alert\n\nHi ${userName},\n\nYou have upcoming scholarship deadlines:\n${textLines.join('\n')}\n\nView all: ${scholarshipsUrl}`;

  await sendMail({ to: toEmail, subject, html, text });
}
