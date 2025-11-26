import React from 'react';
import styles from '@/styles/news.module.css';
import { NewsArticle } from '@/lib/news/fetcher';

interface NewsHeroProps {
    article: NewsArticle;
}

export default function NewsHero({ article }: NewsHeroProps) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroMeta}>
                <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                <span>•</span>
                <span>{article.estimatedReadMinutes} min read</span>
                <span>•</span>
                <span>{article.tags.join(', ')}</span>
            </div>

            <h1 className={styles.heroTitle}>{article.title}</h1>
            {article.subtitle && <p style={{ fontSize: '1.25rem', color: 'var(--news-text-muted)', marginBottom: '2rem' }}>{article.subtitle}</p>}

            {article.heroImage && (
                <img
                    src={article.heroImage.url}
                    alt={article.heroImage.alt}
                    className={styles.heroImage}
                />
            )}
        </section>
    );
}
