// Vercel serverless function: receives the contact form POST from contact.html
// and emails the submission via Gmail SMTP (Nodemailer).
//
// Required environment variables (set these in the Vercel project's
// Settings > Environment Variables — never commit real credentials):
//   GMAIL_USER          - Gmail address that authenticates and sends the mail
//   GMAIL_APP_PASSWORD  - a 16-character Gmail App Password for that account
//                          (Google Account > Security > 2-Step Verification > App Passwords;
//                          2-Step Verification must be enabled first)
// Optional:
//   CONTACT_TO           - inbox that receives submissions
//                          (defaults to donotreplybackiwillnotrespond@gmail.com)

const nodemailer = require('nodemailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_TO = 'donotreplybackiwillnotrespond@gmail.com';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function page(title, heading, message, isError) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/styles.css">
    <title>${title} | Tanush Kulkarni</title>
</head>
<body>
    <section id="intro" style="padding: 3rem 2rem;">
        <h1>${heading}</h1>
        <p>${message}</p>
        <div class="hero-actions">
            <a class="btn" href="/contact.html">Back to Contact</a>
            <a class="btn btn-outline" href="/index.html">Home</a>
        </div>
    </section>
</body>
</html>`;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).send(page('Method Not Allowed', 'Method Not Allowed', 'This endpoint only accepts form submissions.', true));
        return;
    }

    const body = req.body || {};
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();
    const honeypot = (body.company || '').trim(); // hidden field — real visitors leave this blank

    // Spam bots fill every field, including hidden ones. Pretend success without sending mail.
    if (honeypot) {
        res.status(200).send(page('Message Sent', 'Thanks!', 'Your message has been sent.', false));
        return;
    }

    if (!name || !email || !message || !EMAIL_RE.test(email)) {
        res.status(400).send(page('Missing Information', 'Something&rsquo;s missing', 'Please go back and fill out your name, a valid email, and a message.', true));
        return;
    }

    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    const CONTACT_TO = process.env.CONTACT_TO || DEFAULT_TO;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        console.error('Missing GMAIL_USER / GMAIL_APP_PASSWORD environment variables');
        res.status(500).send(page('Server Not Configured', 'Something went wrong', 'The contact form isn&rsquo;t fully configured yet. Please reach out on LinkedIn or GitHub instead.', true));
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    try {
        await transporter.sendMail({
            from: `"Portfolio Contact Form" <${GMAIL_USER}>`,
            to: CONTACT_TO,
            replyTo: email,
            subject: `New portfolio message from ${name}`,
            text: `From: ${name} <${email}>\n\n${message}`,
            html: `<p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
        });

        res.status(200).send(page('Message Sent', `Thanks, ${escapeHtml(name)}!`, "Your message has been sent — I'll get back to you soon.", false));
    } catch (err) {
        console.error('Failed to send contact form email:', err);
        res.status(500).send(page('Send Failed', 'Something went wrong', 'Your message couldn&rsquo;t be sent. Please try again, or reach out on LinkedIn or GitHub instead.', true));
    }
};
