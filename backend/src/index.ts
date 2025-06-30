import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import urlRouter from './routes/url';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/urls', urlRouter);
app.use('/', urlRouter);

const PORT = process.env.PORT || 3000;

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
