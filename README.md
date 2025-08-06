### データベース連携掲示板アプリ
このアプリはSQLiteデータベースを接続している掲示板アプリです。

#### 機能一覧
##### ユーザー管理機能
- 名前とメールアドレスによる会員登録
- ログイン機能
- ログアウト機能
- セッション管理

##### 投稿機能
- メッセージ投稿機能
- メッセージ編集機能 (投稿者のみ)
- メッセージ削除機能 (投稿者のみ)
- ページネーション機能 (5件ずつ)
- 投稿一覧表示

##### セキュリティ
- CSRF対策
- パスワードハッシュ化 (bcryptjs)

#### 使用技術
##### フロントエンド
- HTML
- CSS
- JavaScript
- EJS (テンプレートエンジン)
- Alpine.js
- TailwindCSS (CSSフレームワーク)

##### バックエンド
- Node.js
- Express.js
- Prsima (ORM)
- SQLite (データベース)

##### セキュリティ・ミドルウェア
- bcryptjs
- csurf
- express-session
- express-validator
- connect-flash

### 参考資料
- Node.js 超入門 第4版 掌田津耶乃
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Express.js ルーティングなど](https://expressjs.com/ja/guide/routing.html)
- [Start Here — Alpine.js](https://alpinejs.dev/start-here)
- [Install Tailwind CSS using PostCSS - Tailwind CSS](https://v3.tailwindcss.com/docs/installation/using-postcss)
- [Models | Prisma Documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/models)
- [Quickstart with TypeScript & SQLite | Prisma Documentation](https://www.prisma.io/docs/getting-started/quickstart-sqlite)
- [Mocha](https://mochajs.org/)
- [Chai](https://www.chaijs.com/)
