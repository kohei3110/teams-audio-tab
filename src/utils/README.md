# ロガーユーティリティ (Logger Utility)

このユーティリティは、アプリケーション全体で統一されたデバッグログを出力するために作成されました。異なるログレベルをサポートし、タイムスタンプとコンテキスト情報を含む詳細なログ出力を提供します。

## 特徴

- 4つのログレベルをサポート: DEBUG, INFO, WARN, ERROR
- タイムスタンプを含む詳細なログ出力
- コンポーネントごとにコンテキスト情報を含めることが可能
- 拡張可能な設計

## 使い方

### インポート

```typescript
import { createLogger } from "../utils/logger";
```

### ロガーの作成

```typescript
// デフォルトロガー
import logger from "../utils/logger";

// または、特定のコンテキスト付きでロガーを作成
const logger = createLogger({ context: 'コンポーネント名' });
```

### ログレベルの使い分け

```typescript
// デバッグレベル - 詳細な開発用情報
logger.debug("デバッグメッセージ", オブジェクトやデータ);

// 情報レベル - 一般的な情報
logger.info("情報メッセージ");

// 警告レベル - 潜在的な問題
logger.warn("警告メッセージ");

// エラーレベル - 発生したエラー
logger.error("エラーメッセージ", エラーオブジェクト);
```

### オブジェクトのログ出力

```typescript
const data = { id: 1, name: "テスト" };
logger.debug("データオブジェクト:", data);
```

## 実装例

```typescript
import React, { useState } from "react";
import { createLogger } from "../utils/logger";

const logger = createLogger({ context: 'MyComponent' });

const MyComponent: React.FC = () => {
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    try {
      logger.info("データの取得を開始");
      const response = await fetch('/api/data');
      const result = await response.json();
      logger.debug("取得したデータ:", result);
      setData(result);
      logger.info("データの取得が完了しました");
    } catch (err) {
      logger.error("データ取得中にエラーが発生しました", err);
    }
  };
  
  return (
    <div>
      {/* コンポーネントの内容 */}
    </div>
  );
};

export default MyComponent;
```