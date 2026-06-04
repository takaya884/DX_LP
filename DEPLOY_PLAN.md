# Cloudflare デプロイ & 応募フォーム通知 構築プラン

## 構成

**Cloudflare Pages（GitHub連携） + Pages Functions → Slack 通知**

```
ユーザーがフォーム送信
   │ (fetch POST)
   ▼
Cloudflare Pages Functions  /functions/api/contact.js
   │ Slack Incoming Webhook へ転送
   ▼
あなたの Slack チャンネルに通知 🔔
```

これなら **バックエンドを別途借りる必要がなく、Cloudflare 内で完結・無料枠** で動く。

---

## 現状の把握

- **構成**: `index.html` + `styles.css` + `script.js` の純粋な静的サイト（ビルド不要、フレームワークなし）
- **お問い合わせ部分**: 現状「応募フォーム」は存在しない。`index.html:261-262` にあるのは `mailto:` と `tel:` のリンクだけ

```html
<a href="mailto:contact@example.com" class="btn btn--solid">メールで相談する →</a>
<a href="tel:0000000000" class="btn btn--line">電話で相談する</a>
```

---

## 役割分担

作業は「**私（Claude）がコードを書く部分**」と「**あなたが画面で操作する部分**」に分かれる。

### 🤖 私が作るコード部分

1. `index.html` の mailto リンク部分を、**実際の入力フォーム**（お名前・会社名・メール・電話・相談内容）に置き換え
2. フォーム送信の JS（`script.js` に追記。送信中・完了・エラー表示つき）
3. **`functions/api/contact.js`**（Cloudflare Pages Function）— 受け取った内容を Slack Webhook に転送。スパム対策（簡易 honeypot）込み
4. `styles.css` にフォーム用のスタイル追加（既存デザインに合わせる）
5. `.gitignore` と簡単な `README`（手順メモ）

### 🙋 あなたが操作する部分（アカウント作業）

これは代わりにできないため、手順を渡す。

#### A. Slack の Webhook URL を作る

1. https://api.slack.com/apps → 「Create New App」→ From scratch
2. 通知を受けたいワークスペースを選ぶ
3. 左メニュー「Incoming Webhooks」→ ON
4. 「Add New Webhook to Workspace」→ 通知先チャンネルを選択
5. 発行された `https://hooks.slack.com/services/...` をコピー（**これは秘密。コードに直書きしない**）

#### B. GitHub にリポジトリを作って push

- このフォルダはまだ git 管理外なので、`git init` から。（手順は別途）

#### C. Cloudflare Pages で連携 + 環境変数設定

1. Cloudflare ダッシュボード → Workers & Pages → Create → Pages → Connect to Git
2. GitHub リポジトリを選択（ビルド設定: フレームワークなし / 出力ディレクトリ `/` のまま）
3. デプロイ後、Settings → Environment variables に **`SLACK_WEBHOOK_URL`** = (A でコピーした URL) を登録
   - ↑ こうすることで Webhook URL がコードに残らず安全になる

---

## 進め方

**まず私がコード（①〜⑤）を全部作ってしまう**のが効率的。コードができた状態で、あなたは A→B→C の操作をするだけで公開できる。Webhook URL は環境変数で後から入れるので、コードを書く時点では URL は不要。

### フォーム項目（デフォルト案）

- お名前
- 会社名
- メールアドレス
- 電話番号（任意）
- ご相談内容

追加・削除の希望があれば調整する。

---

## 決定事項（ヒアリング結果）

| 項目 | 選択 |
|---|---|
| デプロイ方法 | GitHub 連携（自動デプロイ） |
| 通知方法 | Slack Incoming Webhook |
| バックエンド | Cloudflare Pages Functions |

---

## デプロイ方法の比較（参考）

| 方法 | 難易度 | 向いている人 |
|---|---|---|
| ダッシュボードにドラッグ&ドロップ | ★ かんたん | まず動かしたい |
| **GitHub 連携（自動デプロイ）** ← 採用 | ★★ | 今後も更新する |
| Wrangler CLI | ★★ | コマンドで管理したい |

## 通知方式の比較（参考）

| 方式 | 通知の受け取り方 | バックエンド | 費用 |
|---|---|---|---|
| A. Pages Functions + メール送信(Resend等) | 指定メールに届く | 自前(Cloudflare内で完結) | 無料枠あり |
| B. 外部フォームサービス(Formspree / Tally等) | メール通知 | 不要（一番簡単） | 無料枠あり |
| **C. Slack / Discord / LINE に Webhook 通知** ← 採用 | チャットに飛ぶ | Pages Functions | 無料 |
| D. Googleスプレッドシートに記録 | シートに溜まる | GAS or Functions | 無料 |
