type HeroSectionProps = {
    date: string;
};

export function HeroSection({ date }: HeroSectionProps) {
    const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });

    return (
        <section className="hero">
            <div className="badge">
                <span className="badge-icon">☕️</span>
                5 min read
            </div>
            <h1 className="title">AI Brew Digest</h1>
            <p className="subtitle">{formattedDate} の生成AIトレンド</p>

            <style jsx>{`
        .hero {
          text-align: center;
          padding: var(--spacing-2xl) 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: 6px 12px;
          background-color: rgba(99, 102, 241, 0.1);
          color: var(--color-primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .title {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .subtitle {
          font-size: 1.125rem;
          color: var(--color-text-muted);
        }
      `}</style>
        </section>
    );
}
