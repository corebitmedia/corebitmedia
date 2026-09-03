// Best-effort email notification for contact form submissions. Fully
// optional: if SMTP env vars aren't set (or nodemailer isn't installed yet),
// this quietly logs and returns instead of throwing — a submission always
// saves to the database and shows up in the admin panel either way, whether
// or not email is configured.

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  nodemailer = null;
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!nodemailer || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Table-based layout + inline styles, since that's what actually renders
// consistently across email clients (Gmail, Outlook, etc. strip <style>
// blocks and modern CSS layout).
function buildContactEmailHtml(submission) {
  const row = (label, value) => (value
    ? `<tr>
        <td style="padding:8px 16px 8px 0;color:#64748b;font-size:13px;font-weight:600;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:8px 0;color:#1a2233;font-size:14px;">${escapeHtml(value)}</td>
      </tr>`
    : '');

  return `
<div style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:#f5f7fa;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0b1f3a;padding:20px 28px;">
      <span style="color:#ffffff;font-size:18px;font-weight:700;">New Contact Form Submission</span>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Name', submission.name)}
        ${row('Email', submission.email)}
        ${row('Phone', submission.phone)}
        ${row('Source', submission.source)}
      </table>
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e2e8f0;">
        <div style="color:#64748b;font-size:13px;font-weight:600;margin-bottom:8px;">Message</div>
        <div style="color:#1a2233;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(submission.message || '(no message)')}</div>
      </div>
    </div>
    <div style="background:#f5f7fa;padding:14px 28px;color:#64748b;font-size:12px;">
      Core Bit Media — reply directly to this email to respond to ${escapeHtml(submission.name)}.
    </div>
  </div>
</div>`;
}

async function sendContactNotification(submission) {
  const t = getTransporter();
  if (!t) {
    if (!nodemailer) {
      console.warn('[mailService] nodemailer not installed — run `npm install` in /backend to enable contact form emails. Submission was still saved.');
    } else {
      console.warn('[mailService] SMTP_HOST/SMTP_USER/SMTP_PASS not set in backend/.env — skipping email. Submission was still saved.');
    }
    return;
  }

  const to = process.env.CONTACT_TO_EMAIL || 'sales@corebitmedia.com';
  const from = process.env.SMTP_FROM || 'Core Bit Media <no-reply@corebitmedia.com>';

  try {
    await t.sendMail({
      from,
      to,
      replyTo: submission.email,
      subject: `New contact form submission — ${submission.name}`,
      text: [
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        submission.phone ? `Phone: ${submission.phone}` : null,
        submission.source ? `Source: ${submission.source}` : null,
        '',
        submission.message || '(no message)'
      ].filter(Boolean).join('\n'),
      html: buildContactEmailHtml(submission)
    });
  } catch (err) {
    console.error('[mailService] Failed to send contact notification email:', err.message);
  }
}

module.exports = { sendContactNotification };
