import React from 'react';
import styles from '@/styles/news.module.css';
import { NewsArticle } from '@/lib/news/fetcher';

interface NewsCTAProps {
    article: NewsArticle;
}

export default function NewsCTA({ article }: NewsCTAProps) {
    return (
        <section className={styles.cta}>
            <h3 className={styles.ctaTitle}>Share this article</h3>
            <div className={styles.ctaButtons} style={{ marginBottom: '2rem' }}>
                <button className={`${styles.button} ${styles.buttonPrimary}`}>
                    Share on X
                </button>
                <button className={`${styles.button} ${styles.buttonPrimary}`}>
                    Share on LinkedIn
                </button>
                <button className={`${styles.button} ${styles.buttonOutline}`}>
                    Copy Link
                </button>
            </div>

            {article.relatedLinks && article.relatedLinks.length > 0 && (
                <>
                    <h3 className={styles.ctaTitle}>Read Next</h3>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        {article.relatedLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                className={styles.keyTakeaways} // Reusing card style
                                style={{ textDecoration: 'none', margin: 0, display: 'block', transition: 'transform 0.2s' }}
                            >
                                <h4 style={{ color: 'var(--news-accent)', marginBottom: '0.5rem' }}>{link.title}</h4>
                                {link.description && <p style={{ fontSize: '0.875rem', color: 'var(--news-text-muted)', margin: 0 }}>{link.description}</p>}
                            </a>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
