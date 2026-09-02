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
      ].filter(Boolean).join('\n')
    });
  } catch (err) {
    console.error('[mailService] Failed to send contact notification email:', err.message);
  }
}

module.exports = { sendContactNotification };
