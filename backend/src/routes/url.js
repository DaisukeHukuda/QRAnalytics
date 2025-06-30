"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const BASE62_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function base62Encode(num) {
    if (num === 0)
        return BASE62_CHARS[0];
    let result = '';
    while (num > 0) {
        result = BASE62_CHARS[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}
function generateShortCode() {
    const uuid = crypto.randomUUID();
    const hash = crypto.createHash('sha256').update(uuid).digest('hex');
    return base62Encode(parseInt(hash.substring(0, 8), 16)).padStart(6, BASE62_CHARS[0]);
}
function isValidUrl(url) {
    try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
    }
    catch (_a) {
        return false;
    }
}
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        exists = (yield prisma.url.findUnique({ where: { shortCode } })) !== null;
        if (!exists)
            break;
    }
    if (exists) {
        res.status(500).json({ error: '短縮コード生成に失敗しました' });
        return;
    }
    const url = yield prisma.url.create({
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
}));
router.get('/:shortCode', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shortCode } = req.params;
    const url = yield prisma.url.findUnique({ where: { shortCode }, select: { originalUrl: true } });
    if (!url || !url.originalUrl) {
        res.status(404).json({ error: '該当する短縮URLが見つかりません' });
        return;
    }
    res.redirect(302, url.originalUrl);
}));
exports.default = router;
