type TagFilterProps = {
    availableTags: { id: string; label: string }[];
    selected: string[];
    onChange: (tags: string[]) => void;
};

export function TagFilter({ availableTags, selected, onChange }: TagFilterProps) {
    const toggleTag = (tagId: string) => {
        if (selected.includes(tagId)) {
            onChange(selected.filter(id => id !== tagId));
        } else {
            onChange([...selected, tagId]);
        }
    };

    return (
        <div className="tag-filter-container">
            <div className="tag-scroll">
                {availableTags.map(tag => {
                    const isActive = selected.includes(tag.id);
                    return (
                        <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`filter-chip ${isActive ? 'active' : ''}`}
                        >
                            {tag.label}
                        </button>
                    );
                })}
            </div>

            <style jsx>{`
        .tag-filter-container {
          width: 100%;
          overflow: hidden;
          margin-bottom: var(--spacing-xl);
          position: relative;
        }

        .tag-filter-container::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 40px;
          background: linear-gradient(to right, transparent, var(--color-bg));
          pointer-events: none;
        }

        .tag-scroll {
          display: flex;
          gap: var(--spacing-sm);
          overflow-x: auto;
          padding-bottom: 4px; /* Hide scrollbar space if needed */
          scrollbar-width: none; /* Firefox */
        }

        .tag-scroll::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        .filter-chip {
          white-space: nowrap;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          background-color: var(--color-surface);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
        }

        .filter-chip:hover {
          background-color: var(--color-surface-hover);
          color: var(--color-text-main);
        }

        .filter-chip.active {
          background-color: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
          box-shadow: 0 0 12px var(--color-primary-glow);
        }
      `}</style>
        </div>
    );
}
