export type DigestEntry = {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    primary_source: { name: string; url: string; logo?: string };
    published_at: string;
    visibility: "featured" | "read-more" | "hidden";
};

export const MOCK_DIGEST_ENTRIES: DigestEntry[] = [
    {
        id: "1",
        title: "Google DeepMindが新モデル「Gemini 1.5 Pro」を発表",
        summary: "Google DeepMindは、コンテキストウィンドウを大幅に拡張した「Gemini 1.5 Pro」を発表しました。最大100万トークンの処理が可能になり、長文のドキュメントや動画の解析精度が向上しています。開発者向けのプレビュー版も公開されました。",
        tags: ["モデル更新", "Google", "LLM"],
        primary_source: { name: "Google DeepMind Blog", url: "https://deepmind.google/technologies/gemini/" },
        published_at: "2025-11-27T02:00:00Z",
        visibility: "featured",
    },
    {
        id: "2",
        title: "OpenAI、動画生成AI「Sora」の一般公開を開始",
        summary: "OpenAIは、テキストから高品質な動画を生成するAI「Sora」を一般公開しました。以前は一部のクリエイター限定でしたが、今回のアップデートでより多くのユーザーが利用可能になります。生成される動画の長さも最大2分に延長されました。",
        tags: ["新ツール", "OpenAI", "動画生成"],
        primary_source: { name: "OpenAI Blog", url: "https://openai.com/sora" },
        published_at: "2025-11-26T23:00:00Z",
        visibility: "featured",
    },
    {
        id: "3",
        title: "Anthropic、Claude 3.5 Sonnetの性能向上版をリリース",
        summary: "Anthropicは、Claude 3.5 Sonnetのマイナーアップデートを実施しました。コーディング能力と推論能力がさらに強化され、特に複雑な指示への追従性が改善されています。API価格は据え置きです。",
        tags: ["モデル更新", "Anthropic", "Claude"],
        primary_source: { name: "Anthropic News", url: "https://www.anthropic.com/news" },
        published_at: "2025-11-27T05:30:00Z",
        visibility: "featured",
    },
    {
        id: "4",
        title: "生成AIの著作権問題に関する新たなガイドライン案",
        summary: "文化庁は、生成AIと著作権に関する新たなガイドライン案を公表しました。学習データの利用範囲や、生成物の権利帰属についての解釈がより明確化されています。パブリックコメントの募集も開始されました。",
        tags: ["規制動向", "著作権", "日本"],
        primary_source: { name: "文化庁", url: "https://www.bunka.go.jp/" },
        published_at: "2025-11-26T10:00:00Z",
        visibility: "featured",
    },
    {
        id: "5",
        title: "Microsoft、Azure AI Studioに新機能を追加",
        summary: "MicrosoftはAzure AI Studioに、プロンプトフローのデバッグ機能や、モデルの評価指標を可視化するダッシュボードを追加しました。これにより、企業でのLLMアプリケーション開発がより効率化されます。",
        tags: ["新ツール", "Microsoft", "Azure"],
        primary_source: { name: "Azure Blog", url: "https://azure.microsoft.com/en-us/blog/" },
        published_at: "2025-11-27T01:00:00Z",
        visibility: "featured",
    },
    {
        id: "6",
        title: "Stability AI、画像生成モデルの軽量版をオープンソース化",
        summary: "Stability AIは、コンシューマー向けGPUでも動作する軽量な画像生成モデルをオープンソースとして公開しました。高速な推論が可能で、エッジデバイスでの利用も想定されています。",
        tags: ["モデル更新", "Stability AI", "画像生成"],
        primary_source: { name: "Stability AI Blog", url: "https://stability.ai/blog" },
        published_at: "2025-11-26T15:00:00Z",
        visibility: "read-more",
    },
];
