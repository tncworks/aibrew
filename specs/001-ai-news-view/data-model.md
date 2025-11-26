# データモデル: 生成AIニュース閲覧画面

## エンティティ定義

### NewsArticle (ニュース記事)

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | string | YES | 記事の一意なID (UUID or Slug) |
| `title` | string | YES | 記事のタイトル (最大50文字推奨) |
| `subtitle` | string | NO | サブタイトル/リード文 |
| `publishDate` | string | YES | 公開日時 (ISO 8601) |
| `author` | Author | YES | 著者情報 |
| `tags` | string[] | YES | 関連タグ (例: "LLM", "Generative AI") |
| `heroImage` | Image | NO | ヒーロー画像。ない場合は代替背景を使用。 |
| `estimatedReadMinutes` | number | YES | 読了目安時間 (分) |
| `bodyBlocks` | ContentBlock[] | YES | 本文ブロックの配列 |
| `keyTakeaways` | string[] | YES | 主要ポイント (3点推奨) |
| `relatedLinks` | RelatedLink[] | NO | 関連記事/リンク |

### ContentBlock (本文ブロック)

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `type` | enum | YES | `paragraph`, `heading`, `quote`, `image`, `list` |
| `content` | string | YES | テキスト内容または画像URL |
| `metadata` | object | NO | 画像のキャプションや引用元など |

### RelatedLink (関連リンク)

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `title` | string | YES | リンクタイトル |
| `description` | string | NO | リンク説明 |
| `url` | string | YES | 遷移先URL |
| `sourceType` | enum | YES | `internal` (関連記事), `external` (外部ソース) |

### Author (著者)

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | string | YES | 著者名 |
| `avatarUrl` | string | NO | アバター画像URL |

## バリデーションルール

- `title`: 必須。空文字不可。
- `estimatedReadMinutes`: 1以上。計算値が1未満の場合は1とする。
- `keyTakeaways`: 最大3つまで表示。
