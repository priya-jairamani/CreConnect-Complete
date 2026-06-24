const { Op } = require('sequelize');
const { OTP } = require('../models');

const OTP_TTL_MINUTES = 10;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function createOTP(email) {
  await OTP.update({ used: true }, { where: { email, used: false } });

  const code      = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await OTP.create({ email, code, expiresAt });
  return code;
}

async function verifyOTP(email, code) {
  const otp = await OTP.findOne({
    where: { email, code, used: false, expiresAt: { [Op.gte]: new Date() } },
    order: [['createdAt', 'DESC']],
  });
  if (!otp) return false;
  await otp.update({ used: true });
  return true;
}

module.exports = { createOTP, verifyOTP };
