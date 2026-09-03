// Best-effort email notification for contact form submissions. Fully
// optional: if RESEND_API_KEY isn't set, this quietly logs and returns
// instead of throwing — a submission always saves to the database and shows
// up in the admin panel either way, whether or not email is configured.
//
// Uses Resend's HTTP API (not raw SMTP) on purpose: Render's free tier
// blocks outbound SMTP (ports 587/465) entirely, which made nodemailer time
// out against every provider tried (Namecheap and Gmail alike) — a plain
// HTTPS POST isn't subject to that block.

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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[mailService] RESEND_API_KEY not set — skipping email. Submission was still saved.');
    return;
  }

  const to = process.env.CONTACT_TO_EMAIL || 'sales@corebitmedia.com';
  // Resend's shared sandbox sender works with no setup; swap in RESEND_FROM
  // once corebitmedia.com's domain is verified with Resend for a branded
  // "from" address instead.
  const from = process.env.RESEND_FROM || 'Core Bit Media <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: submission.email,
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
      })
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[mailService] Resend API error:', res.status, body);
    }
  } catch (err) {
    console.error('[mailService] Failed to send contact notification email:', err.message);
  }
}

module.exports = { sendContactNotification };
