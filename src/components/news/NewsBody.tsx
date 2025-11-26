'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/news.module.css';
import { NewsArticle } from '@/lib/news/fetcher';

interface NewsBodyProps {
    article: NewsArticle;
}

export default function NewsBody({ article }: NewsBodyProps) {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBar}
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            <article className={styles.body}>
                {/* Key Takeaways */}
                {article.keyTakeaways.length > 0 && (
                    <div className={styles.keyTakeaways}>
                        <h3>Key Takeaways</h3>
                        <ul>
                            {article.keyTakeaways.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Body Blocks */}
                {article.bodyBlocks.map((block, index) => {
                    switch (block.type) {
                        case 'paragraph':
                            return <p key={index}>{block.content}</p>;
                        case 'heading':
                            return <h2 key={index}>{block.content}</h2>;
                        case 'quote':
                            return <blockquote key={index} className={styles.quote}>{block.content}</blockquote>;
                        case 'image':
                            return (
                                <img
                                    key={index}
                                    src={block.content}
                                    alt={block.metadata?.alt || ''}
                                    style={{ width: '100%', borderRadius: '0.5rem', margin: '2rem 0' }}
                                />
                            );
                        case 'list':
                            // Assuming content is newline separated for simplicity or we need to parse it
                            return (
                                <ul key={index} style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                    {block.content.split('\n').map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            );
                        default:
                            return null;
                    }
                })}
            </article>
        </>
    );
}
