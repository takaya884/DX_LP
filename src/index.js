// Worker エントリ
// - http / *.html への旧URL … 正規URL（https・拡張子なし）へ 301
// - POST /api/contact … お問い合わせをSlackへ通知
// - それ以外 … public/ の静的アセット（LP本体）を返す
import { handleContact } from './contact.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // SEO: 正規URLを1つにそろえる（http→https、/index.html→/、/xxx.html→/xxx）
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    let canonical = null;
    if (url.protocol === 'http:' && !isLocal) {
      url.protocol = 'https:';
      canonical = url;
    }
    if (url.pathname.endsWith('.html')) {
      url.pathname = url.pathname.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
      canonical = url;
    }
    if (canonical) return Response.redirect(canonical.toString(), 301);

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
