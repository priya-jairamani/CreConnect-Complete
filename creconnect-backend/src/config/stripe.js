const Stripe = require('stripe');
const { STRIPE_SECRET_KEY } = require('./env');

if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
}

module.exports = new Stripe(STRIPE_SECRET_KEY);
