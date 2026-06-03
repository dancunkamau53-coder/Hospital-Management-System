const paypal = require('@paypal/checkout-server-sdk');

const environment = () => {
  const mode = process.env.PAYPAL_MODE?.toLowerCase() || 'sandbox';
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client ID and secret must be configured in environment variables');
  }

  if (mode === 'live') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

const client = () => new paypal.core.PayPalHttpClient(environment());

module.exports = {
  client,
  paypal
};
