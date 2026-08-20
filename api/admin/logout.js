const { cookieHeader } = require('./_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  res.setHeader('Set-Cookie', cookieHeader('', { clear: true }));
  return res.status(200).json({ success: true });
};
