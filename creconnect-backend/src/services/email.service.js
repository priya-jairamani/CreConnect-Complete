const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = require('../config/env');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

async function send(to, subject, html) {
  if (!SMTP_HOST) {
    logger.warn(`[Email skipped — no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error('Email send failed:', err.message);
  }
}

const sendVerificationEmail = (to, token) =>
  send(
    to,
    'Verify your CreConnect account',
    `<p>Click <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">here</a> to verify your email.</p>`
  );

const sendPasswordReset = (to, token) =>
  send(
    to,
    'Reset your CreConnect password',
    `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">here</a> to reset your password. Link expires in 1 hour.</p>`
  );

const sendOTP = (to, code) =>
  send(to, 'Your CreConnect OTP', `<p>Your one-time code is: <strong>${code}</strong>. Valid for 10 minutes.</p>`);

module.exports = { sendVerificationEmail, sendPasswordReset, sendOTP };
