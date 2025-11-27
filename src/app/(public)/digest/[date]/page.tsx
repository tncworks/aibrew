"use client";

import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { TagFilter } from "@/components/TagFilter";
import { DigestCard } from "@/components/DigestCard";
import { MOCK_DIGEST_ENTRIES } from "@/utils/mockData";

const AVAILABLE_TAGS = [
  { id: "モデル更新", label: "モデル更新" },
  { id: "新ツール", label: "新ツール" },
  { id: "業界動向", label: "業界動向" },
  { id: "規制動向", label: "規制動向" },
  { id: "コミュニティ", label: "コミュニティ" },
];

export default function DigestPage({ params }: { params: { date: string } }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter entries based on selected tags
  const filteredEntries = MOCK_DIGEST_ENTRIES.filter((entry) => {
    if (selectedTags.length === 0) return true;
    return entry.tags.some((tag) => selectedTags.includes(tag));
  });

  const featuredEntries = filteredEntries.filter(e => e.visibility === 'featured');
  const readMoreEntries = filteredEntries.filter(e => e.visibility === 'read-more');

  return (
    <main className="container">
      <HeroSection date={params.date} />

      <TagFilter
        availableTags={AVAILABLE_TAGS}
        selected={selectedTags}
        onChange={setSelectedTags}
      />

      <section className="entries-grid">
        {featuredEntries.map((entry) => (
          <DigestCard key={entry.id} entry={entry} />
        ))}
      </section>

      {readMoreEntries.length > 0 && (
        <section className="read-more-section">
          <h3 className="section-title">さらに読む</h3>
          <div className="entries-grid">
            {readMoreEntries.map((entry) => (
              <DigestCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {filteredEntries.length === 0 && (
        <div className="empty-state">
          <p>該当する記事が見つかりませんでした。</p>
          <button
            onClick={() => setSelectedTags([])}
            className="reset-button"
          >
            フィルターを解除
          </button>
        </div>
      )}

      <style jsx>{`
        .entries-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .read-more-section {
          margin-top: var(--spacing-2xl);
          padding-top: var(--spacing-xl);
          border-top: 1px solid var(--color-border);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--spacing-lg);
          color: var(--color-text-main);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--color-text-muted);
        }

        .reset-button {
          margin-top: var(--spacing-md);
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-weight: 600;
        }

        .reset-button:hover {
          text-decoration: underline;
        }

        @media (min-width: 768px) {
          .entries-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          }
        }
      `}</style>
    </main>
  );
}
