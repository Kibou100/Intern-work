const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const USERS = [
  {
    id: 'admin-01',
    email: 'admin@monaltech.com',
    password: 'SecurePass123',
    name: 'Monal Tech Admin',
  },
];

const activeSessions = new Map();

function createToken() {
  return crypto.randomBytes(24).toString('hex');
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = createToken();
  activeSessions.set(token, { userId: user.id, email: user.email, created: Date.now() });

  res.json({ token, redirect: '/dashboard.html' });
});

app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const session = activeSessions.get(token);
  if (!session) return res.status(401).json({ message: 'Session expired' });

  res.json({ email: session.email, userId: session.userId });
});

app.post('/api/logout', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (token) activeSessions.delete(token);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path === '/' ? 'index.html' : req.path);
  if (req.path.endsWith('.html') || req.path === '/') {
    return res.sendFile(filePath, err => {
      if (err) res.status(404).send('Not found');
    });
  }
  return res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Monal Tech portal backend running on http://localhost:${PORT}`);
});
