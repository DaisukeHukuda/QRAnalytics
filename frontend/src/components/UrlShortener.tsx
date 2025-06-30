import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = '/api/urls';

const UrlShortener: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    if (!originalUrl) {
      setError('URLを入力してください');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(API_BASE, { originalUrl });
      if (res.data && res.data.shortCode) {
        // バックエンドはlocalhost:3000で稼働中
        const url = window.location.origin + '/' + res.data.shortCode;
        setShortUrl(url);
      } else {
        setError('短縮URLの生成に失敗しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shortUrl) {
      await navigator.clipboard.writeText(shortUrl);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">URL短縮サービス</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="url"
          className="border rounded px-3 py-2"
          placeholder="短縮したいURLを入力"
          value={originalUrl}
          onChange={e => setOriginalUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '送信中...' : '短縮する'}
        </button>
      </form>
      {error && (
        <div className="mt-4 text-red-600 text-center">{error}</div>
      )}
      {shortUrl && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="text-gray-700">短縮URL:</span>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">{shortUrl}</a>
          <button
            onClick={handleCopy}
            className="mt-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            コピー
          </button>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
