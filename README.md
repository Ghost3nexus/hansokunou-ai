# EC店長 - Shopify Store Management System

EC店長は、Shopify店舗の運営を効率化するための総合的な管理システムです。商品登録、バナー制作、競合分析など、EC運営に必要な機能を自動化します。

## 目次

- [機能概要](#機能概要)
- [セットアップ](#セットアップ)
- [環境変数の設定](#環境変数の設定)
- [Shopify CLIのインストール](#shopify-cliのインストール)
- [初期デプロイ](#初期デプロイ)
- [パフォーマンステスト](#パフォーマンステスト)
- [モジュール](#モジュール)
- [競合デザイン監査ワークフロー](#競合デザイン監査ワークフロー)
- [トラブルシューティング](#トラブルシューティング)
- [貢献](#貢献)
- [ライセンス](#ライセンス)

## 機能概要

EC店長は以下の主要機能を提供します：

- **商品データETL**: スプレッドシートからShopifyへの商品データ同期
- **AI商品説明生成**: GPT-4oを活用した高品質な商品説明文の自動生成
- **バナー自動生成**: プロンプトからDALL·E 3を使用したバナー画像生成
- **テーマ最適化**: モバイルパフォーマンスを重視したテーマ設定
- **競合デザイン監査**: 競合サイトの分析に基づくテーマ改善提案
- **CI/CD**: 自動テスト、デプロイ、モニタリングのワークフロー

## セットアップ

### 環境変数の設定

1. リポジトリをクローン
   ```bash
   git clone https://github.com/your-org/shopify-ec-manager.git
   cd shopify-ec-manager
   ```

2. 依存関係のインストール
   ```bash
   npm install
   ```

3. `.env.example`を`.env`にコピーし、必要な環境変数を設定
   ```bash
   cp .env.example .env
   ```

4. 各APIキーの取得方法については[APIキー取得ガイド](docs/api_keys_guide.md)を参照

### Shopify CLIのインストール

```bash
npm install -g @shopify/cli @shopify/theme
```

### 初期デプロイ

```bash
npm run deploy:test
```

### パフォーマンステスト

```bash
npm run lighthouse
```

## モジュール

EC店長は以下のモジュールで構成されています：

- **ETL**: 商品データの抽出・変換・読み込み
- **Description**: AI商品説明生成
- **Creative**: バナー自動生成
- **Theme**: Shopifyテーマ管理
- **Utils**: 共通ユーティリティ

詳細なアーキテクチャについては[ARCHITECTURE.md](docs/ARCHITECTURE.md)を参照してください。

## 競合デザイン監査ワークフロー

EC店長には、競合サイトのデザインを自動的に監査し、テーマの改善提案を生成する機能が含まれています。

### 監査の実行

1. GitHub Actionsから「Competitor Design Audit」ワークフローを選択
2. キーワードを入力（例：「高級バッグ」「ミニマルファッション」など）
3. 「Run workflow」をクリック

### 監査レポート

監査が完了すると、以下が生成されます：

- Markdownレポート（色彩分析、タイポグラフィ分析、レイアウトパターンなど）
- テーマ設定の提案（colors, typography, spacing, componentsの推奨設定）
- Slackへの通知

### テーマの自動更新

監査結果に基づいて、テーマを自動的に更新することができます：

1. 監査ワークフローの「apply-theme-patch」ジョブが実行される
2. テーマ設定（theme/config/settings_data.json）が更新される
3. 変更内容がPRとして作成される
4. Lighthouseテストが実行され、パフォーマンススコアの変化が報告される

### 手動でのテーマパッチ適用

```bash
node scripts/apply_theme_patch.js
```

詳細なドキュメントは [docs/design_audit.md](docs/design_audit.md) を参照してください。

## トラブルシューティング

一般的な問題と解決策については[トラブルシューティングガイド](docs/troubleshooting.md)を参照してください。

## 貢献

プロジェクトへの貢献方法については[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
