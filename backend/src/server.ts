import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Simple health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Very basic in-memory auth (placeholder)
const USERS: Record<string, string> = {
  // username: password
  'demo': 'secret',
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const ok = USERS[username] && USERS[username] === password;
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Issue a dummy token (replace with proper session/JWT and HttpOnly cookie)
  const token = 'dummy-token-' + Math.random().toString(36).slice(2);
  res.json({ token, user: { username } });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
