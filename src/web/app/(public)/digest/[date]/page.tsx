"use client";

import { useEffect, useState } from "react";
import { TagFilterPanel } from "../../../../components/filters/TagFilterPanel";

type DigestEntry = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  primary_source: { name: string; url: string };
  visibility: "featured" | "read-more" | "hidden";
};

type DigestResponse = {
  date: string;
  entries: DigestEntry[];
  readMore: DigestEntry[];
  status: {
    fallbackActive: boolean;
    bannerMessage?: string;
  };
};

const DEFAULT_TAGS = [
  { id: "model-update", label: "モデル更新" },
  { id: "new-tools", label: "新ツール" },
  { id: "industry-insight", label: "業界動向" },
  { id: "regulation", label: "規制動向" },
  { id: "community", label: "コミュニティ" },
];

export default function DigestPage({ params }: { params: { date: string } }) {
  const [data, setData] = useState<DigestResponse | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const tagsQuery = selectedTags.length
        ? `&tags=${selectedTags.join(",")}`
        : "";
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(
        `/api/v1/digests?date=${params.date}${tagsQuery}${searchQuery}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as DigestResponse;
      setData(json);
    };
    fetchData();
  }, [params.date, selectedTags, search]);

  if (!data) {
    return <p>読み込み中...</p>;
  }

  return (
    <main>
      <h1>{data.date} の生成AIダイジェスト</h1>
      {data.status.fallbackActive && (
        <div className="banner">{data.status.bannerMessage}</div>
      )}
      <TagFilterPanel
        availableTags={DEFAULT_TAGS}
        selected={selectedTags}
        search={search}
        onChange={({ tags, search }) => {
          setSelectedTags(tags);
          setSearch(search);
        }}
      />
      <section>
        {data.entries.map((entry) => (
          <article key={entry.id}>
            <h2>{entry.title}</h2>
            <p>{entry.summary}</p>
            <p>
              <a href={entry.primary_source.url} target="_blank" rel="noreferrer">
                {entry.primary_source.name} を読む
              </a>
            </p>
            <div className="tag-badges">
              {entry.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
      {data.readMore.length > 0 && (
        <section>
          <h3>さらに読む</h3>
          <ul>
            {data.readMore.map((entry) => (
              <li key={entry.id}>
                <a href={entry.primary_source.url} target="_blank" rel="noreferrer">
                  {entry.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
