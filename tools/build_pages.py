#!/usr/bin/env python3
"""下層ページ（サービス別・実績詳細・料金の考え方）を public/ に生成する。

使い方: python3 tools/build_pages.py
ページ内容は PAGES を編集する。生成物（public/service/*.html など）は直接編集しないこと。
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "public"
SITE = "https://protmake.com"
UPDATED = "2026-10-01"
ORG = {"@id": f"{SITE}/#organization"}

# ---------------------------------------------------------------------------
# ページ定義
#   sections: (見出し, 本文HTML) のリスト
#   faq:      (質問, 答え) のリスト → 本文と FAQPage 構造化データの両方に出力
# ---------------------------------------------------------------------------
PAGES = [
    {
        "path": "service/system",
        "kind": "service",
        "eyebrow": "CUSTOM BUSINESS SYSTEM",
        "title": "御社専用の業務システム開発",
        "seo_title": "業務システム開発（オーダーメイド）｜名古屋・全国対応｜プロトメイク",
        "description": "中小企業向けの業務システム開発。市販ソフトに仕事を合わせるのではなく、今のやり方に合わせて一から作ります。2週間で動く見本、約1ヶ月で本番システム。契約前は費用0円。名古屋拠点・全国オンライン対応。",
        "service_type": "業務システム開発",
        "lead": "エクセルや紙、市販ソフトの組み合わせで回している仕事を、御社のやり方そのままのシステムにします。まず2週間で「動く見本」をお見せし、約1ヶ月で実際に使えるシステムをお渡しします。",
        "sections": [
            ("こんなお悩みはありませんか？", """<ul>
<li>エクセルの表が増えすぎて、どれが最新か分からない</li>
<li>同じ内容を何度も別の表やシステムに書き写している</li>
<li>市販のソフトを試したが、自社のやり方に合わず使われなくなった</li>
<li>システム会社に相談したら、見積もりが高く期間も長かった</li>
<li>「作ってみたら思っていたのと違った」という失敗が怖い</li>
</ul>"""),
            ("プロトメイクの業務システム開発とは", """<p>プロトメイクは、株式会社GRAZKeが提供する中小企業向けのシステム開発サービスです。仕様書や見積もりを先に作るのではなく、御社の仕事で実際にさわれる<b>「動く見本（プロトタイプ）」を2週間で</b>お見せします。</p>
<p>見本をさわりながら「ここはこうしたい」を確かめ、業務で使える<b>本番システムを相談から最短約1ヶ月</b>でお渡しします。ここまでの費用は0円。実際に使ってみて、気に入っていただけた場合のみ契約です。</p>"""),
            ("作れるシステムの例", """<ul>
<li><b>在庫管理</b>：店舗・倉庫ごとの在庫をひと目で確認、在庫切れの警告、入出庫の履歴</li>
<li><b>棚卸・入出庫</b>：バーコードを読み取る手持ちの機械（ハンディ端末）やスマホで現場入力</li>
<li><b>集計・日報</b>：毎日の数字の集計や報告書づくりを自動化</li>
<li><b>顧客・案件管理</b>：お客様情報、やりとりの履歴、進み具合を一か所に</li>
<li><b>受発注・予約</b>：電話やFAXで受けていた注文・予約の受付と管理</li>
<li><b>社内向け管理画面</b>：記事・商品・会員など、データの登録・検索・公開管理</li>
<li><b>他システムとのデータ連携</b>：今使っているシステムとデータを自動でそろえる</li>
</ul>
<p>実際の制作例は<a href="/works/inventory">在庫管理システム</a>、<a href="/works/stocktake">ハンディ端末の棚卸システム</a>、<a href="/works/article-cms">記事管理システム</a>をご覧ください。</p>"""),
            ("市販のソフト（SaaS）との違い", """<div class="sub-table"><table>
<thead><tr><th></th><th>市販のソフト</th><th>プロトメイク</th></tr></thead>
<tbody>
<tr><th>仕事のやり方</th><td>ソフトに合わせて変える</td><td>今のやり方に合わせて作る</td></tr>
<tr><th>必要な機能</th><td>不要な機能も多い／足りない機能は追加できない</td><td>必要な分だけ。あとから追加もできる</td></tr>
<tr><th>導入前の確認</th><td>無料お試し（汎用画面）</td><td>御社の仕事で動く見本をさわれる</td></tr>
<tr><th>向いている場合</th><td>業界で一般的な使い方で足りる</td><td>独自のやり方・複数の表の手作業が多い</td></tr>
</tbody></table></div>
<p>市販のソフトで十分な場合は、無理にシステムを作ることはおすすめしません。ご相談の中で正直にお伝えします。</p>"""),
            ("進め方", """<ol class="sub-steps">
<li><b>無料オンライン相談</b>：今困っていることと、理想の状態をお聞きします（費用0円）</li>
<li><b>2週間で動く見本</b>：実際にさわって、イメージとのズレを確認します（費用0円）</li>
<li><b>約1ヶ月で本番システム</b>：業務ですぐ使える状態でお渡しします（費用0円）</li>
<li><b>契約判断</b>：使ってみて気に入っていただけたら契約・本格運用へ</li>
</ol>"""),
        ],
        "faq": [
            ("小さな会社でも依頼できますか？", "はい。従業員数名〜数十名の中小企業・個人事業の方からのご相談が中心です。必要な機能だけを小さく作るので、大きな予算は必要ありません。"),
            ("どんなシステムでも作れますか？", "日々の仕事をラクにする御社専用の業務システムが得意です。大規模なサービス開発や、市販のソフトで十分な業種の場合はお引き受けできないことがあります。"),
            ("名古屋以外でも対応できますか？", "はい。拠点は名古屋ですが、打ち合わせはオンライン中心のため全国対応しています。"),
            ("作ったあとの修正や追加はできますか？", "はい。使いながら出てきた要望に合わせて、機能の追加・修正を続けられます。"),
        ],
    },
    {
        "path": "service/prototype",
        "kind": "service",
        "eyebrow": "PROTOTYPE / MVP",
        "title": "2週間で「動く見本」をお見せするプロトタイプ開発",
        "seo_title": "プロトタイプ開発・MVP開発｜2週間で動く見本を無料で｜プロトメイク",
        "description": "資料や見積もりの前に、実際にさわれる「動く見本（プロトタイプ）」を2週間・無料でお見せします。約1ヶ月で業務に使えるMVPをお渡し。納得してから契約なので「思っていたのと違う」がありません。",
        "service_type": "プロトタイプ開発",
        "lead": "システム開発の失敗でいちばん多いのは「できあがったら、思っていたのと違った」。プロトメイクは、最初に動く見本をお見せすることでこのズレをなくします。",
        "sections": [
            ("「動く見本（プロトタイプ）」とは", """<p>画面のイメージ図や資料ではなく、実際にボタンを押したりデータを入れたりできる、<b>さわれる試作品</b>のことです。御社の実際の仕事の流れに沿って作るので、現場の方にもさわってもらいながら「使えるかどうか」を判断できます。</p>"""),
            ("なぜ見本から始めるのか", """<ul>
<li><b>言葉だけではイメージがそろわない</b>：仕様書の段階では、発注側と開発側で思い描いている画面が違うことがよくあります</li>
<li><b>やり直しが減る</b>：早い段階でズレに気づけるので、作ってからの大きな作り直しを防げます</li>
<li><b>社内の合意がとりやすい</b>：実物を見せられるので、社内の説明や稟議が通しやすくなります</li>
<li><b>リスクがない</b>：見本づくりは0円。合わなければ費用はかかりません</li>
</ul>"""),
            ("見本から本番システム（MVP）まで", """<p>見本で方向性が決まったら、業務に必要な分だけを本番システムとして仕上げます。最初から全部の機能を作るのではなく、まず使える最小限の形（MVP）を約1ヶ月でお渡しし、使いながら育てていきます。</p>
<ol class="sub-steps">
<li><b>DAY 0</b>：無料オンライン相談</li>
<li><b>DAY 14</b>：動く見本をお見せ</li>
<li><b>DAY 30</b>：使えるシステムをお渡し（ここまで0円）</li>
<li><b>契約判断</b>：気に入っていただけたら契約</li>
</ol>"""),
        ],
        "faq": [
            ("本当に見本づくりは無料ですか？", "はい。初回相談、動く見本づくり、実際に使えるシステムのお渡しまで費用はかかりません。気に入っていただけた場合のみ契約となります。"),
            ("見本を見て、合わなかったらどうなりますか？", "その時点で終了でき、費用は発生しません。無理な勧誘もしません。"),
            ("2週間で何ができるのですか？", "御社の仕事の中心となる画面と操作の流れを、実際にさわれる形でご用意します。細かい機能は見本を見ながら一緒に決めていきます。"),
        ],
    },
    {
        "path": "service/ai",
        "kind": "service",
        "eyebrow": "GENERATIVE AI",
        "title": "AI（ChatGPTなど）の活用サポート・社内研修",
        "seo_title": "生成AI導入支援・社内研修｜ChatGPTを仕事に活かす｜プロトメイク",
        "description": "ChatGPTなどの生成AIを、御社の仕事に合わせて使えるようにするサポート。資料づくり・問い合わせ対応・データ整理の自動化、システムへのAI組み込み、社員向けレクチャー・社内勉強会まで。中小企業向け、全国オンライン対応。",
        "service_type": "生成AI導入支援",
        "lead": "「AIが便利らしいけど、うちの仕事で何に使えるのか分からない」。そんな段階から、御社の業務に合わせた使い方を一緒に見つけ、現場で使いこなせるところまで伴走します。",
        "sections": [
            ("できること", """<ul>
<li><b>業務の洗い出しと活用提案</b>：AIで置き換えられる作業・時間のかかっている作業を一緒に洗い出します</li>
<li><b>作業の自動化</b>：資料・メール文面の下書き、問い合わせへの返信案、データの整理・要約など</li>
<li><b>システムへのAI組み込み</b>：プロトメイクで作る業務システムに、AIによる入力補助・自動分類・要約などを組み込みます</li>
<li><b>社員向けレクチャー・社内勉強会</b>：現場のメンバーが自分で使いこなせるよう、実際の業務を題材に使い方をお伝えします</li>
</ul>"""),
            ("活用の例", """<ul>
<li>問い合わせメールの内容を読み取り、担当者別に振り分け・返信案を作成</li>
<li>日報や議事録を要約し、毎週の報告資料を自動で下書き</li>
<li>手書き・PDFの帳票から必要な項目を読み取り、表に整理</li>
<li>社内マニュアルをもとに、社員からの質問に答える仕組み</li>
</ul>
<p>どこまでAIに任せ、どこを人が確認するかも、業務に合わせて設計します。</p>"""),
            ("進め方", """<p>まず無料のオンライン相談で、今の仕事の流れと困りごとをお聞きします。AIで効果が出そうな作業が見つかれば、システム開発と同じく<b>動く見本</b>で実際に試していただき、納得いただけた場合に契約となります。</p>"""),
        ],
        "faq": [
            ("AIについて詳しくなくても相談できますか？", "はい。「何に使えるか分からない」段階からのご相談が多いです。専門用語を使わずにご説明します。"),
            ("社内向けの勉強会だけでも依頼できますか？", "はい。社員向けのレクチャーや社内勉強会だけのご依頼にも対応しています。"),
            ("社外秘の情報をAIに入れても大丈夫ですか？", "使うサービスや設定によって扱いが変わります。入れてよい情報の線引きや、安全な使い方のルールづくりもあわせてご提案します。"),
        ],
    },
    {
        "path": "service/web",
        "kind": "service",
        "eyebrow": "WEBSITE",
        "title": "ホームページ制作・リニューアル",
        "seo_title": "ホームページ制作・リニューアル｜集客・採用につながるサイトへ｜プロトメイク",
        "description": "中小企業のホームページ制作・リニューアル。新規制作、作り直し、スマホ対応、表示の高速化、問い合わせの増える導線づくり、検索・AI対策、公開後の運用サポートまで。名古屋拠点・全国オンライン対応。",
        "service_type": "ホームページ制作",
        "lead": "「とりあえず作っただけ」のホームページを、お客様や採用につながる形へ。集客・採用といった目的から逆算して作り、公開後の更新や運用までご相談いただけます。",
        "sections": [
            ("対応内容", """<ul>
<li><b>新規制作</b>：会社案内、サービス紹介、採用ページ、LP（1枚ものの紹介ページ）</li>
<li><b>リニューアル</b>：古くなった見た目の一新、伝わりにくい内容の整理</li>
<li><b>スマホ対応</b>：スマホで見やすく、操作しやすいレイアウトに</li>
<li><b>表示の高速化</b>：画像の軽量化などで、待たされないサイトに</li>
<li><b>問い合わせ導線の見直し</b>：入力しやすいフォーム、通知の自動化（Slackなど）</li>
<li><b>検索・AI対策</b>：Google検索やChatGPTなどのAIに内容が正しく伝わる作り（構造化データ、llms.txt など）</li>
<li><b>公開後の運用</b>：文章・写真の更新、ページ追加などの継続サポート</li>
</ul>"""),
            ("進め方", """<p>ホームページも、まず<b>動く見本</b>をお見せするところから始めます。実際の画面をスマホやパソコンで確認しながら内容を固め、納得いただいてから公開・契約へ進みます。</p>"""),
        ],
        "faq": [
            ("今あるホームページの一部だけ直すこともできますか？", "はい。スマホ対応や表示の高速化、問い合わせフォームの改善など、部分的なご依頼にも対応しています。"),
            ("ホームページとあわせて業務システムも相談できますか？", "はい。問い合わせ・予約の受付をそのまま社内の管理システムにつなぐなど、まとめてご相談いただけます。"),
        ],
    },
    {
        "path": "pricing",
        "kind": "page",
        "eyebrow": "PRICING",
        "title": "料金の考え方",
        "seo_title": "料金の考え方｜契約前は0円・納得してから契約｜プロトメイク",
        "description": "プロトメイクの料金の考え方。初回相談・動く見本づくり・使えるシステムのお渡しまで費用0円。高額な固定見積もりではなく、実際に使って価値に納得いただいた分での契約です。",
        "lead": "プロトメイクでは、着手前に高額な見積もりを出して契約していただく形はとっていません。実際に使えるシステムをさわっていただき、価値に納得いただいてから契約です。",
        "sections": [
            ("契約前にかかる費用は0円", """<div class="sub-table"><table>
<thead><tr><th>段階</th><th>内容</th><th>費用</th></tr></thead>
<tbody>
<tr><th>STEP 01</th><td>無料オンライン相談</td><td>0円</td></tr>
<tr><th>STEP 02</th><td>動く見本（2週間）</td><td>0円</td></tr>
<tr><th>STEP 03</th><td>使えるシステムのお渡し（約1ヶ月）</td><td>0円</td></tr>
<tr><th>STEP 04</th><td>契約・本格運用</td><td>ここで初めて発生</td></tr>
</tbody></table></div>
<p>見本やシステムを見て「合わない」と感じた場合は、その時点で終了できます。費用はかかりません。</p>"""),
            ("なぜ固定見積もりを出さないのか", """<p>一般的なシステム開発では、作る前に仕様を決めて見積もりを出し、契約してから開発を始めます。しかし作る前の段階では、本当に必要な機能や使い勝手は分かりません。その結果、「思っていたのと違う」「追加費用がかかった」ということが起こりがちです。</p>
<p>プロトメイクは先に実物をお見せするので、<b>何にいくら払うのかを、実物を見てから判断</b>していただけます。</p>"""),
            ("契約後の料金", """<p>契約後の料金は、システムの規模や使い方、御社にとっての価値に応じて、無理のない形でご相談のうえ決めます。具体的な金額は、動く見本をお見せしたあとにご提示します。</p>"""),
        ],
        "faq": [
            ("あとから高額な請求が来ることはありませんか？", "ありません。契約前に費用は発生せず、契約内容・金額にご納得いただいてからのお支払いです。"),
            ("見積もりだけ先に欲しいのですが。", "作る前の見積もりは不確かになりやすいため、まず無料の動く見本でご判断いただくことをおすすめしています。目安が必要な場合はご相談ください。"),
        ],
    },
    {
        "path": "works/inventory",
        "kind": "work",
        "eyebrow": "WORKS — 他システム連携",
        "title": "在庫管理システム（他システムとデータ連携）",
        "seo_title": "在庫管理システムの開発事例（他システム連携）｜プロトメイク",
        "description": "店舗ごとの在庫をひと目で確認できる在庫管理システムの開発事例。商品・在庫管理、在庫切れの警告、入出庫履歴、他システムとのデータ連携による在庫数の自動同期に対応。",
        "image": ("/works/inventory.webp", "在庫管理システムの管理画面", 1374, 1370),
        "lead": "店舗ごとの在庫状況を一つの画面でひと目で確認できる在庫管理システムです。他のシステムとデータをつなぎ、在庫の数を自動でそろえられるようにしました。",
        "sections": [
            ("解決したかったこと", """<ul>
<li>店舗ごとの在庫が別々に管理され、全体の状況がすぐに分からない</li>
<li>他のシステムと在庫の数を手作業で合わせており、ズレや手間が発生する</li>
<li>在庫切れに気づくのが遅れる</li>
</ul>"""),
            ("主な機能", """<ul>
<li>店舗ごとの在庫状況を一覧・ひと目で確認できる画面</li>
<li>商品・在庫の登録と管理</li>
<li>在庫切れ・在庫が少ない商品の警告</li>
<li>入出庫の履歴</li>
<li>他システムとのデータ連携による在庫数の自動同期</li>
</ul>"""),
            ("こんな会社におすすめ", """<p>複数の店舗・倉庫で在庫を持っている、ECサイトや販売管理システムと在庫数を手作業で合わせている、といった会社に向いています。今お使いのシステムを活かしたまま、足りない部分だけを作ることもできます。</p>"""),
        ],
        "faq": [],
    },
    {
        "path": "works/stocktake",
        "kind": "work",
        "eyebrow": "WORKS — ハンディ端末アプリ",
        "title": "ハンディ端末（バーコード読み取り機）の棚卸システム",
        "seo_title": "ハンディ端末の棚卸システム開発事例（バーコード・オフライン対応）｜プロトメイク",
        "description": "バーコードを読み取るハンディ端末向けの棚卸アプリの開発事例。入庫・出庫・棚卸・納品チェックを現場で完結。電波がない場所でも作業でき、後からまとめて送受信できるオフライン対応。",
        "image": ("/works/ht-stocktake.webp", "ハンディ端末向け棚卸システムのメニュー画面", 828, 1034),
        "lead": "バーコードを読み取る手持ちの機械（ハンディ端末）向けの棚卸アプリです。入庫・出庫・棚卸・納品チェックを現場でその場で済ませられます。",
        "sections": [
            ("解決したかったこと", """<ul>
<li>紙に書いた数を、事務所でエクセルに打ち直している</li>
<li>書き写しの手間とミスが発生する</li>
<li>倉庫の奥など、電波が届かない場所で作業が止まる</li>
</ul>"""),
            ("主な機能", """<ul>
<li>バーコード読み取りによる入庫・出庫・棚卸・納品チェック</li>
<li>読み取ったデータを端末内に保存</li>
<li>電波がない場所でも作業を継続（オフライン対応）</li>
<li>電波の届く場所で、後からまとめてデータを送受信</li>
</ul>"""),
            ("こんな会社におすすめ", """<p>倉庫・工場・店舗のバックヤードで在庫を数えている、紙とエクセルで棚卸をしている、電波の弱い場所で作業がある、といった現場に向いています。ハンディ端末のほか、スマホのカメラでの読み取りにも対応できます。</p>"""),
        ],
        "faq": [],
    },
    {
        "path": "works/article-cms",
        "kind": "work",
        "eyebrow": "WORKS — 業務システム",
        "title": "記事管理システム（管理画面）",
        "seo_title": "記事管理システム（CMS管理画面）の開発事例｜プロトメイク",
        "description": "記事の作成・編集、公開・非公開の切り替え、検索・絞り込み、タグ整理、利用者ごとの権限管理を一つの画面で行える記事管理システム（CMS）の開発事例。",
        "image": ("/works/article-cms.webp", "記事管理システムの管理画面", 1604, 660),
        "lead": "記事の作成・編集から、公開・非公開の切り替え、タイトルや本文での検索・絞り込みまでを一つの画面で行える管理画面です。",
        "sections": [
            ("主な機能", """<ul>
<li>記事の作成・編集・削除</li>
<li>公開・非公開の切り替え</li>
<li>タイトル・本文での検索、条件での絞り込み</li>
<li>タグによる整理</li>
<li>利用者ごとの権限設定</li>
</ul>"""),
            ("こんな会社におすすめ", """<p>お知らせ・ブログ・商品情報などを複数人で更新している、今のツールが使いにくく更新が止まりがち、といった場合に向いています。記事以外にも、商品・会員・案件など、データの登録と公開管理が必要な業務に応用できます。</p>"""),
        ],
        "faq": [],
    },
]

NAV = [
    ("/service/system", "業務システム開発"),
    ("/service/prototype", "プロトタイプ開発"),
    ("/service/ai", "AI活用サポート"),
    ("/service/web", "ホームページ制作"),
    ("/pricing", "料金の考え方"),
    ("/works/inventory", "実績：在庫管理"),
    ("/works/stocktake", "実績：棚卸システム"),
    ("/works/article-cms", "実績：記事管理"),
]


def esc(s):
    return html.escape(s, quote=True)


def jsonld(p):
    url = f"{SITE}/{p['path']}"
    crumbs = [("トップ", f"{SITE}/")]
    if p["kind"] == "service":
        crumbs.append(("サービス", f"{SITE}/#service"))
    elif p["kind"] == "work":
        crumbs.append(("実績", f"{SITE}/#works"))
    crumbs.append((p["title"], url))
    graph = [
        {
            "@type": "WebPage",
            "@id": f"{url}#webpage",
            "url": url,
            "name": p["seo_title"],
            "description": p["description"],
            "inLanguage": "ja",
            "isPartOf": {"@id": f"{SITE}/#website"},
            "about": ORG,
            "dateModified": UPDATED,
            "breadcrumb": {"@id": f"{url}#breadcrumb"},
        },
        {
            "@type": "BreadcrumbList",
            "@id": f"{url}#breadcrumb",
            "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "name": n, "item": u}
                for i, (n, u) in enumerate(crumbs)
            ],
        },
    ]
    if p["kind"] == "service":
        graph.append({
            "@type": "Service",
            "@id": f"{url}#service",
            "name": p["title"],
            "serviceType": p["service_type"],
            "description": p["description"],
            "provider": ORG,
            "areaServed": {"@type": "Country", "name": "日本"},
            "url": url,
        })
    if p["kind"] == "work":
        src, alt, w, h = p["image"]
        graph.append({
            "@type": "CreativeWork",
            "@id": f"{url}#work",
            "name": p["title"],
            "description": p["description"],
            "creator": ORG,
            "image": {"@type": "ImageObject", "url": SITE + src, "width": w, "height": h, "caption": alt},
            "url": url,
        })
    if p["faq"]:
        graph.append({
            "@type": "FAQPage",
            "@id": f"{url}#faq",
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in p["faq"]
            ],
        })
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)


def render(p):
    url = f"{SITE}/{p['path']}"
    crumb_mid = ""
    if p["kind"] == "service":
        crumb_mid = '<a href="/#service">サービス</a><span>/</span>'
    elif p["kind"] == "work":
        crumb_mid = '<a href="/#works">実績</a><span>/</span>'

    figure = ""
    if p.get("image"):
        src, alt, w, h = p["image"]
        figure = (f'<figure class="sub-shot"><span class="work__bar" aria-hidden="true"><i></i><i></i><i></i></span>'
                  f'<img src="{src}" alt="{esc(alt)}" width="{w}" height="{h}" /></figure>')

    body = "\n".join(
        f'      <section class="legal__sec">\n        <h2><span class="num">{i + 1:02d}</span>{esc(h)}</h2>\n        {c}\n      </section>'
        for i, (h, c) in enumerate(p["sections"])
    )

    faq = ""
    if p["faq"]:
        items = "\n".join(
            f'          <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in p["faq"]
        )
        faq = (f'      <section class="legal__sec">\n        <h2><span class="num">Q&amp;A</span>よくある質問</h2>\n'
               f'        <div class="sub-faq">\n{items}\n        </div>\n      </section>')

    related = "\n".join(
        f'          <a href="{href}">{esc(label)} <i>→</i></a>' for href, label in NAV if href != f"/{p['path']}"
    )

    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(p['seo_title'])}</title>
  <meta name="description" content="{esc(p['description'])}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="{url}" />
  <link rel="alternate" hreflang="ja" href="{url}" />
  <meta name="theme-color" content="#173a44" />
  <link rel="icon" href="/logo-grazke.png" type="image/png" />
  <meta property="og:site_name" content="プロトメイク" />
  <meta property="og:title" content="{esc(p['seo_title'])}" />
  <meta property="og:description" content="{esc(p['description'])}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="{url}" />
  <meta property="og:locale" content="ja_JP" />
  <meta property="og:image" content="{SITE}/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM向けサイト概要" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <script type="application/ld+json">
{jsonld(p)}
  </script>
</head>
<body>
  <div class="grain" aria-hidden="true"></div>

  <header class="header is-scrolled" id="header">
    <div class="shell header__inner">
      <a href="/" class="logo">
        <img src="/logo-grazke.webp" alt="株式会社GRAZKe" class="logo__img" width="256" height="256" />
        <span class="logo__name">プロトメイク</span>
      </a>
      <nav class="nav" id="nav">
        <a href="/#service">サービス</a>
        <a href="/#flow">進め方</a>
        <a href="/#works">実績</a>
        <a href="/pricing">料金</a>
        <a href="/#faq">Q&amp;A</a>
        <a href="/#contact" class="nav__cta">無料で見本を依頼 <span>→</span></a>
      </nav>
      <button class="burger" id="navToggle" aria-label="メニュー" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>
    </div>
  </header>

  <section class="legal-hero">
    <div class="shell shell--narrow">
      <nav class="sub-crumb" aria-label="パンくずリスト"><a href="/">トップ</a><span>/</span>{crumb_mid}<b>{esc(p['title'])}</b></nav>
      <p class="legal-hero__eyebrow">{esc(p['eyebrow'])}</p>
      <h1 class="legal-hero__title sub-title">{esc(p['title'])}</h1>
      <p class="sub-lead">{esc(p['lead'])}</p>
      <p class="legal-hero__date">最終更新：<time datetime="{UPDATED}">{UPDATED.replace('-', '.')}</time></p>
    </div>
  </section>

  <main class="legal">
    <div class="shell shell--narrow">
{('      ' + figure) if figure else ''}
{body}
{faq}
      <aside class="sub-cta">
        <p class="sub-cta__sm">相談・見本づくりは0円／無理な勧誘なし</p>
        <p class="sub-cta__lg">まずは、御社の仕事で<br class="sp" />「動く見本」をさわってみませんか。</p>
        <a href="/#contact" class="btn btn--solid" data-cta="sub-{p['path'].replace('/', '-')}"><span>無料で「動く見本」を依頼する</span><i class="btn__arrow">→</i></a>
      </aside>

      <nav class="sub-links" aria-label="関連ページ">
        <p class="sub-links__ttl">関連ページ</p>
        <div>
{related}
        </div>
      </nav>
    </div>
  </main>

  <footer class="footer">
    <div class="shell footer__inner">
      <div class="footer__brand">
        <p class="footer__logo">プロトメイク <span>-protmake-</span></p>
        <p class="footer__tag">御社の業務に、<br />ぴったり合うシステムを。</p>
      </div>
      <dl class="footer__info">
        <div><dt>会社名</dt><dd>株式会社 GRAZKe</dd></div>
        <div><dt>所在地</dt><dd>〒460-0002<br />愛知県名古屋市中区丸の内2丁目3-23 和波ビル6階</dd></div>
        <div><dt>担当</dt><dd>林 貴也</dd></div>
      </dl>
      <nav class="footer__nav">
        <a href="/service/system">業務システム開発</a><a href="/service/prototype">プロトタイプ開発</a>
        <a href="/service/ai">AI活用サポート</a><a href="/service/web">ホームページ制作</a>
        <a href="/pricing">料金の考え方</a><a href="/#contact">お問い合わせ</a>
        <a href="/privacy">プライバシーポリシー</a>
      </nav>
    </div>
    <p class="footer__copy">© 2026 株式会社GRAZKe</p>
  </footer>

  <script src="/script.js" defer></script>
</body>
</html>
"""


def main():
    for p in PAGES:
        out = ROOT / f"{p['path']}.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render(p), encoding="utf-8")
        print("wrote", out.relative_to(ROOT.parent))


if __name__ == "__main__":
    main()
