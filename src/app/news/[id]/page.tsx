import React from 'react';
import { getNewsArticle } from '@/lib/news/fetcher';
import NewsHero from '@/components/news/NewsHero';
import NewsBody from '@/components/news/NewsBody';
import NewsCTA from '@/components/news/NewsCTA';
import styles from '@/styles/news.module.css';

export default async function NewsPage({ params }: { params: { id: string } }) {
    const article = await getNewsArticle(params.id);

    if (!article) {
        return (
            <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>Article not found</h1>
                    <p>The article you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <main className={styles.container}>
            <NewsHero article={article} />
            <NewsBody article={article} />
            <NewsCTA article={article} />
        </main>
    );
}
