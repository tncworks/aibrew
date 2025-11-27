import Link from 'next/link';
import { DigestEntry } from '@/utils/mockData';

type DigestCardProps = {
    entry: DigestEntry;
};

export function DigestCard({ entry }: DigestCardProps) {
    return (
        <article className="digest-card">
            <div className="card-header">
                <div className="source-info">
                    <span className="source-name">{entry.primary_source.name}</span>
                    <span className="publish-time">
                        {new Date(entry.published_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <a href={entry.primary_source.url} target="_blank" rel="noreferrer" className="external-link-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>

            <h2 className="card-title">
                <a href={entry.primary_source.url} target="_blank" rel="noreferrer">
                    {entry.title}
                </a>
            </h2>

            <p className="card-summary">{entry.summary}</p>

            <div className="card-footer">
                <div className="tags">
                    {entry.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .digest-card {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          transition: var(--transition-normal);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .digest-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .source-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .source-name {
          font-weight: 600;
          color: var(--color-primary);
        }

        .external-link-icon {
          color: var(--color-text-muted);
          transition: var(--transition-fast);
        }

        .external-link-icon:hover {
          color: var(--color-text-main);
        }

        .card-title {
          font-size: 1.25rem;
          line-height: 1.4;
          font-weight: 700;
          margin: 0;
        }

        .card-title a {
          transition: var(--transition-fast);
        }

        .card-title a:hover {
          color: var(--color-primary);
        }

        .card-summary {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .card-footer {
          margin-top: auto;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .tag {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: var(--radius-full);
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--color-text-muted);
          border: 1px solid transparent;
          transition: var(--transition-fast);
        }

        .digest-card:hover .tag {
          border-color: var(--color-border);
        }
      `}</style>
        </article>
    );
}
