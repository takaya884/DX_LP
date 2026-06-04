// お問い合わせフォーム受信 → Slack Incoming Webhook へ通知
//
// 必要な環境変数（Cloudflare ダッシュボード → 設定 → 変数とシークレット）:
//   SLACK_WEBHOOK_URL = https://hooks.slack.com/services/XXX/YYY/ZZZ
// ※ Webhook URL はコードに直書きせず、必ず環境変数（Secret）で渡すこと。

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export async function handleContact(request, env) {
  // 1) JSON を読む
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  // 2) honeypot（bot が埋めると弾く）
  if (body.website) {
    return json({ ok: true }); // bot には成功を装って静かに破棄
  }

  // 3) 必須項目チェック
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !message || !emailRe.test(email)) {
    return json({ ok: false, error: 'missing required fields' }, 422);
  }

  // 4) Webhook URL の確認
  if (!env.SLACK_WEBHOOK_URL) {
    return json({ ok: false, error: 'server not configured' }, 500);
  }

  // 5) Slack メッセージを組み立て
  const fields = [
    ['会社名・屋号', body.company],
    ['お名前', name],
    ['メール', email],
    ['電話番号', body.tel],
    ['従業員数', body.size],
    ['きっかけ', body.source],
  ]
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => ({ type: 'mrkdwn', text: `*${k}*\n${String(v).trim()}` }));

  const slackPayload = {
    text: `📩 新しいお問い合わせ：${name} 様`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '📩 新しいお問い合わせ', emoji: true } },
      ...(fields.length ? [{ type: 'section', fields }] : []),
      { type: 'section', text: { type: 'mrkdwn', text: `*ご相談内容*\n${message}` } },
    ],
  };

  // 6) Slack へ送信
  try {
    const res = await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });
    if (!res.ok) return json({ ok: false, error: 'slack error' }, 502);
  } catch {
    return json({ ok: false, error: 'network error' }, 502);
  }

  return json({ ok: true });
}
