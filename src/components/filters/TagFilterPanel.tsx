"use client";

import { useEffect, useState } from "react";

type Tag = {
  id: string;
  label: string;
};

type Props = {
  availableTags: Tag[];
  selected: string[];
  search: string;
  onChange: (next: { tags: string[]; search: string }) => void;
};

export function TagFilterPanel({ availableTags, selected, search, onChange }: Props) {
  const [localTags, setLocalTags] = useState<string[]>(selected);
  const [keyword, setKeyword] = useState(search);

  useEffect(() => {
    setLocalTags(selected);
  }, [selected]);

  useEffect(() => {
    setKeyword(search);
  }, [search]);

  const toggleTag = (id: string) => {
    const next = localTags.includes(id)
      ? localTags.filter((tag) => tag !== id)
      : [...localTags, id];
    setLocalTags(next);
    onChange({ tags: next, search: keyword });
  };

  return (
    <section>
      <h3>タグで絞り込み</h3>
      <div className="tag-grid">
        {availableTags.map((tag) => (
          <label key={tag.id} className="tag-chip">
            <input
              type="checkbox"
              checked={localTags.includes(tag.id)}
              onChange={() => toggleTag(tag.id)}
            />
            {tag.label}
          </label>
        ))}
      </div>
      <div className="search-box">
        <input
          value={keyword}
          placeholder="キーワード検索"
          onChange={(e) => {
            const value = e.target.value;
            setKeyword(value);
            onChange({ tags: localTags, search: value });
          }}
        />
      </div>
    </section>
  );
}
