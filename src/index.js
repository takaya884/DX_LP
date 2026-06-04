// Worker エントリ
// - POST /api/contact … お問い合わせをSlackへ通知
// - それ以外 … public/ の静的アセット（LP本体）を返す
import { handleContact } from './contact.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ ok: false, error: 'method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
      return handleContact(request, env);
    }

    // 静的アセット（index.html / styles.css / script.js …）
    return env.ASSETS.fetch(request);
  },
};
