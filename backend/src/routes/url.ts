import * as crypto from 'crypto';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const BASE62_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function base62Encode(num: number): string {
  if (num === 0) return BASE62_CHARS[0];
  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

function generateShortCode(): string {
  const uuid = crypto.randomUUID();
  const hash = crypto.createHash('sha256').update(uuid).digest('hex');
  return base62Encode(parseInt(hash.substring(0, 8), 16)).padStart(6, BASE62_CHARS[0]);
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

router.post('/', async (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl || typeof originalUrl !== 'string' || !isValidUrl(originalUrl)) {
    res.status(400).json({ error: '有効なURLを指定してください' });
    return;
  }

  // 衝突回避しつつ短縮コード生成
  let shortCode = '';
  let exists = true;
  for (let i = 0; i < 5; i++) {
    shortCode = generateShortCode();
    exists = (await prisma.url.findUnique({ where: { shortCode } })) !== null;
    if (!exists) break;
  }
  if (exists) {
    res.status(500).json({ error: '短縮コード生成に失敗しました' });
    return;
  }

  const url = await prisma.url.create({
    data: {
      originalUrl,
      shortCode,
    },
  });
  res.status(201).json({
    id: url.id ? url.id.toString() : undefined,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
  });
});

router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const url = await prisma.url.findUnique({ where: { shortCode }, select: { originalUrl: true } });
  if (!url || !url.originalUrl) {
    res.status(404).json({ error: '該当する短縮URLが見つかりません' });
    return;
  }
  res.redirect(302, url.originalUrl);
});

export default router;
