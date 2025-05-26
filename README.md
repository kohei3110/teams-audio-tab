# Teams オーディオキャプチャタブアプリ

このアプリは、React と Fluent UI を使用して、Microsoft Teams、Outlook、Microsoft 365 アプリに組み込める視覚的に魅力的なWebページの作成方法を示しています。また、内蔵のシングルサインオンとMicrosoft Graphからのデータによって、エンドユーザーエクスペリエンスを向上させます。

このアプリは、SSOを実装するために[On-Behalf-Of フロー](https://learn.microsoft.com/ja-jp/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow)を採用し、Azure Functions を中間層サービスとして使用し、Azure Functions から Graph を呼び出すための認証されたリクエストを行います。

## Teams オーディオキャプチャタブアプリの開始方法

> **前提条件**
>
> ローカル開発環境でReact with Fluent UI テンプレートを実行するには、以下が必要です：
>
> - [Node.js](https://nodejs.org/)（サポートされているバージョン: 18, 20, 22）
> - [開発用 Microsoft 365 アカウント](https://docs.microsoft.com/ja-jp/microsoftteams/platform/toolkit/accounts)
>   注意：開発者テナントをOffice 365 Target Releaseに登録した後、登録が有効になるまで数日かかる場合があります。
> - [Microsoft 365 Agents Toolkit Visual Studio Code 拡張機能](https://aka.ms/teams-toolkit) バージョン 5.0.0 以上または [Microsoft 365 Agents Toolkit CLI](https://aka.ms/teamsfx-toolkit-cli)

1. まず、VS Code ツールバーの左側にある Microsoft 365 Agents Toolkit アイコンを選択します。
2. Account セクションで、まだサインインしていない場合は [Microsoft 365 アカウント](https://docs.microsoft.com/ja-jp/microsoftteams/platform/toolkit/accounts) でサインインします。
3. F5 キーを押してデバッグを開始し、Web ブラウザーを使用して Teams でアプリを起動します。`Debug in Teams (Edge)` または `Debug in Teams (Chrome)` を選択します。
4. ブラウザーで Teams が起動したら、ダイアログの追加ボタンを選択して、アプリを Teams にインストールします。

これで、Teams、Outlook、Microsoft 365 アプリで美しいWebページを表示できるアプリケーションが実行されています。

![Personal tab demo](https://github.com/OfficeDev/TeamsFx/assets/63089166/9599b53c-8f89-493f-9f7e-9edae1f9be54)

## テンプレートに含まれるもの

| フォルダー       | 内容                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `.vscode`    | デバッグ用のVSCodeファイル                                                                                             |
| `appPackage` | アプリケーションマニフェストのテンプレート                                                                           |
| `env`        | 環境設定ファイル                                                                                                      |
| `infra`      | Azureリソースプロビジョニング用のテンプレート                                                                             |
| `src`        | タブアプリケーションのフロントエンドソースコード。Fluent UI フレームワークで実装されています。                         |
| `api`        | タブアプリケーションのバックエンドソースコード。Azure Functionsを使用してOBOフローでシングルサインオンを実装しています。 |

以下は Microsoft 365 Agents Toolkit 固有のプロジェクトファイルです。Microsoft 365 Agents Toolkit の動作について理解するには、[Github の完全ガイド](https://github.com/OfficeDev/TeamsFx/wiki/Teams-Toolkit-Visual-Studio-Code-v5-Guide#overview)をご覧ください。

| ファイル                 | 内容                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `m365agents.yml`       | Microsoft 365 Agents Toolkit のメインプロジェクトファイルです。プロジェクトファイルでは、プロパティと設定ステージの定義という2つの主要な要素を定義します。                                                                                                               |
| `m365agents.local.yml` | ローカル実行とデバッグを有効にするアクションで `m365agents.yml` を上書きします。                                                                                                                                                                   |
| `aad.manifest.json`  | Microsoft Entra アプリの設定を定義するファイルです。このテンプレートは[シングルテナント](https://learn.microsoft.com/azure/active-directory/develop/single-and-multi-tenant-apps#who-can-sign-in-to-your-app) Microsoft Entra アプリのみをプロビジョニングします。 |

## React with Fluent UI テンプレートの拡張

以下のドキュメントは、React with Fluent UI テンプレートを拡張するのに役立ちます。

- [環境の追加または管理](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/teamsfx-multi-env)
- [マルチ機能アプリの作成](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/add-capability)
- [既存の Microsoft Entra アプリケーションの使用](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/use-existing-aad-app)
- [アプリマニフェストのカスタマイズ](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/teamsfx-preview-and-customize-app-manifest)
- [クラウドリソースのプロビジョニング](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/provision)と[クラウドへのコードのデプロイ](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/deploy)によるAzureでのアプリホスティング
- [アプリ開発での共同作業](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/teamsfx-collaboration)
- [CI/CDパイプラインの設定](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/use-cicd-template)
- [組織またはMicrosoft App Storeへのアプリの発行](https://learn.microsoft.com/ja-jp/microsoftteams/platform/toolkit/publish)
- [アプリのマルチテナント対応の有効化](https://github.com/OfficeDev/TeamsFx/wiki/Multi-tenancy-Support-for-Azure-AD-app)
- [モバイルクライアントでのアプリのプレビュー](https://aka.ms/teamsfx-mobile)

## アーキテクチャ概要

このプロジェクトは以下の技術スタックを使用しています：

### フロントエンド
- **React 18**: メインのUIフレームワーク
- **Fluent UI React Components**: Microsoft のデザインシステム
- **Microsoft Teams JavaScript SDK**: Teams との統合
- **TypeScript**: 型安全な開発

### バックエンド
- **Azure Functions**: サーバーレスAPIエンドポイント
- **On-Behalf-Of (OBO) フロー**: シングルサインオンの実装
- **Microsoft Graph**: Microsoft 365 データへのアクセス

### インフラストラクチャ
- **Azure Active Directory**: 認証とアクセス制御
- **Azure Static Web Apps**: フロントエンドのホスティング
- **Azure Functions**: バックエンドAPIのホスティング

## 音声キャプチャ機能

このアプリケーションには、Teams タブ内でマイクからの音声をキャプチャする機能が含まれています。

### 制限事項
- Teams タブアプリケーションでは、セキュリティポリシーによりマイクアクセスが制限される場合があります
- Permissions Policy の設定が必要です
- ブラウザの権限設定に依存します

### 代替案
1. **Teams会議アプリ**: 会議中でのメディアストリーム機能
2. **Azure Speech Services**: バックエンドでの音声処理
3. **ファイルアップロード**: ユーザーが録音したファイルの処理

## 開発のベストプラクティス

### コード品質
- TypeScript の厳格な型チェックを使用
- ESLint と Prettier による コードフォーマット
- React の最新パターン（Hooks、関数コンポーネント）を採用

### セキュリティ
- Microsoft Entra ID による認証
- OBO フローによる安全なトークン交換
- 最小権限の原則に基づく権限設定

### パフォーマンス
- React.memo によるコンポーネントの最適化
- useCallback と useMemo による再レンダリングの制御
- 遅延読み込みによるバンドルサイズの最適化

## トラブルシューティング

### よくある問題
1. **Teams SDK の初期化エラー**: `microsoftTeams.app.initialize()` の呼び出しを確認
2. **認証エラー**: Entra ID アプリケーションの設定を確認
3. **権限エラー**: マニフェストファイルの権限設定を確認

### デバッグ方法
- F5 キーによるローカルデバッグ
- ブラウザの開発者ツールでのコンソール確認
- Microsoft 365 Agents Toolkit のログ確認

## サポートとリソース

- [Microsoft Teams アプリ開発ドキュメント](https://learn.microsoft.com/ja-jp/microsoftteams/platform/)
- [Microsoft 365 Agents Toolkit](https://aka.ms/teams-toolkit)
- [Fluent UI React Components](https://react.fluentui.dev/)
- [Azure Functions ドキュメント](https://learn.microsoft.com/ja-jp/azure/azure-functions/)
