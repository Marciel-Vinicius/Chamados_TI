// backend/src/utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: String(process.env.EMAIL_SECURE || 'true').toLowerCase() === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify().catch(err => {
    console.error('[Mailer] Falha ao verificar transporte SMTP:', err?.message || err);
});

module.exports = transporter;
