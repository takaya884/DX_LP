# デプロイ手順書（Cloudflare Pages + GitHub + Slack通知）

ゴール：
- 静的サイトを Cloudflare Pages に公開（仮URL `〇〇.pages.dev`、ドメインは後で追加）
- お問い合わせフォーム送信 → Slack に通知

作業は **A → B → C → D** の順。所要 20〜30分ほど。

```
ローカル(このフォルダ) ──push──▶ GitHub ──自動デプロイ──▶ Cloudflare Pages
                                                              │ /api/contact (Function)
                                                              ▼
                                                         Slack 通知 🔔
```

---

## 事前メモ

- 必要アカウント：**GitHub** / **Cloudflare**（どちらも無料）/ 通知を受ける **Slack** ワークスペース
- このフォルダの構成（デプロイ対象）
  ```
  index.html / styles.css / script.js   ← 静的サイト本体
  functions/api/contact.js              ← フォーム受信→Slack転送(サーバー側)
  .gitignore
  ```

---

## A. Slack の Webhook URL を作る（先に取得しておくと楽）

1. https://api.slack.com/apps を開く →「**Create New App**」→「**From scratch**」
2. App名（例：`お問い合わせ通知`）を入力 → 通知を受けたい**ワークスペースを選択**→ Create
3. 左メニュー「**Incoming Webhooks**」→ トグルを **On**
4. 下の「**Add New Webhook to Workspace**」→ **通知先チャンネルを選択** → 許可
5. 発行された URL（`https://hooks.slack.com/services/XXX/YYY/ZZZ`）を**コピーして控える**
   - ⚠️ これは秘密情報。GitHub やコードに**絶対に貼らない**（後で Cloudflare の環境変数に入れる）

---

## B. GitHub にリポジトリを作って push する

### B-1. GitHub 側で空のリポジトリを作成（ブラウザ）

1. https://github.com/new を開く
2. **Repository name**：例 `order-system-lp`（任意）
3. 公開範囲：**Private** でOK（Cloudflare から読めれば良い）
4. 「Add README」などの**チェックは全部オフ**（空のまま作る）
5. 「**Create repository**」

作成後に表示される `https://github.com/<ユーザー名>/<リポジトリ名>.git` を控える。

### B-2. ローカルを git 管理にして push（ターミナル）

このフォルダ（`/Users/takamacm1/freelance/DX_LP`）で順に実行：

```bash
cd /Users/takamacm1/freelance/DX_LP

git init
git add .
git commit -m "初回コミット: LP + お問い合わせフォーム(Slack通知)"
git branch -M main

# ↓ <...> は B-1 で控えた自分のURLに置き換える
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git

git push -u origin main
```

- push 時に GitHub のログインを求められたら、ブラウザ認証 or トークンで認証する。
- うまくいけば GitHub のページにファイルが表示される。

---

## C. Cloudflare Pages に接続してデプロイ

1. https://dash.cloudflare.com にログイン
2. 左メニュー「**Workers & Pages**」→「**Create**」→「**Pages**」タブ →「**Connect to Git**」
3. GitHub を連携（初回は GitHub 側で Cloudflare を Authorize）→ **B で作ったリポジトリを選択**
4. ビルド設定（**ここ重要・静的サイトなので空でOK**）：
   - **Framework preset**：`None`
   - **Build command**：空欄のまま
   - **Build output directory**：`/`（ルート。空なら `/` を指定）
5. 「**Save and Deploy**」→ 数十秒でデプロイ完了
6. 発行された **`〇〇.pages.dev`** を開いて表示確認

> この時点で見た目は公開済み。ただしフォーム送信はまだ通知されない（D が必要）。

---

## D. Slack Webhook を環境変数に登録（フォーム通知を有効化）

1. Cloudflare の対象 Pages プロジェクト →「**Settings**」→「**Variables and Secrets**」
   （または「Environment variables」）
2. **Production** に追加：
   - **Variable name**：`SLACK_WEBHOOK_URL`
   - **Value**：A で控えた `https://hooks.slack.com/services/...`
   - 可能なら「**Encrypt（Secret）**」を選ぶ
3. 保存後、**再デプロイ**して反映：
   - Pages の「Deployments」→ 最新の「⋯」→「**Retry deployment**」
   - もしくは適当に GitHub へ1コミット push すると自動で再デプロイ
4. 公開URLのフォームから**テスト送信** → Slack に通知が届けば完成 🎉

---

## 今後の更新の流れ（運用）

ファイルを直したら、ターミナルで：

```bash
git add .
git commit -m "変更内容のメモ"
git push
```

push するだけで Cloudflare Pages が**自動で再デプロイ**される。

---

## 独自ドメインを後で追加するとき

1. ドメインを取得（お名前.com / Cloudflare Registrar など）
2. Cloudflare Pages プロジェクト →「**Custom domains**」→「**Set up a domain**」
3. 取得したドメインを入力し、画面の指示どおり DNS を設定
4. 数分〜で `https://あなたのドメイン` で公開される（pages.dev も併用可）

---

## つまずきやすいポイント

| 症状 | 原因・対処 |
|---|---|
| サイトは出るがフォーム送信が「失敗しました」 | D の環境変数 `SLACK_WEBHOOK_URL` 未設定／未再デプロイ。設定後に Retry deployment |
| CSS が当たらない・崩れる | Build output directory が `/`（ルート）になっているか確認 |
| `git push` で認証エラー | GitHub のパスワード認証は不可。ブラウザ認証か Personal Access Token を使う |
| Slackに二重通知 | テスト送信が複数回成功しているだけ。問題なし |

---

## メモ：ローカルで送信まで試したい場合（任意）

Cloudflare 上でなくても、wrangler でローカル検証が可能（このPCには wrangler 4.x 導入済み）：

```bash
# Webhook をローカル用に設定（.dev.vars は .gitignore 済み）
echo 'SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/XXX/YYY/ZZZ"' > .dev.vars

npx wrangler pages dev .
# 表示された http://localhost:8788 を開いてフォーム送信テスト
```
