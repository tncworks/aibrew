import { Firestore } from '@google-cloud/firestore';
// import { NewsArticle } from '@/types/news'; // Removed invalid import

// Since we don't have a shared types file yet, let's define the interface here for now or create a types file.
// Ideally, we should create a types file. Let's create src/types/news.ts in the next step.
// For now, I will use 'any' or define a local interface to avoid errors, but I will create the types file immediately after.

export interface NewsArticle {
    id: string;
    title: string;
    subtitle?: string;
    publishDate: string;
    author: {
        name: string;
        avatarUrl?: string;
    };
    tags: string[];
    heroImage?: {
        url: string;
        alt: string;
    };
    estimatedReadMinutes: number;
    bodyBlocks: {
        type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list';
        content: string;
        metadata?: any;
    }[];
    keyTakeaways: string[];
    relatedLinks?: {
        title: string;
        url: string;
        sourceType: 'internal' | 'external';
        description?: string;
    }[];
}

const firestore = new Firestore();

export async function getNewsArticle(id: string): Promise<NewsArticle | null> {
    // For development/mocking purposes, if the ID is 'mock-id', return mock data.
    if (id === 'mock-id') {
        return getMockArticle();
    }

    try {
        const doc = await firestore.collection('news').doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return doc.data() as NewsArticle;
    } catch (error) {
        console.error('Error fetching news article:', error);
        return null;
    }
}

function getMockArticle(): NewsArticle {
    return {
        id: 'mock-id',
        title: 'Generative AI: The Next Frontier',
        subtitle: 'How LLMs are reshaping the software industry',
        publishDate: new Date().toISOString(),
        author: {
            name: 'Jane Doe',
            avatarUrl: 'https://via.placeholder.com/150'
        },
        tags: ['AI', 'LLM', 'Tech'],
        estimatedReadMinutes: 5,
        heroImage: {
            url: 'https://via.placeholder.com/800x400',
            alt: 'AI Abstract Art'
        },
        keyTakeaways: [
            'LLMs are becoming more efficient.',
            'Multimodal capabilities are expanding.',
            'Ethical considerations are paramount.'
        ],
        bodyBlocks: [
            {
                type: 'paragraph',
                content: 'Generative AI has seen rapid advancements in recent years...'
            },
            {
                type: 'heading',
                content: 'The Rise of Transformers'
            },
            {
                type: 'paragraph',
                content: 'The transformer architecture has revolutionized NLP...'
            },
            {
                type: 'quote',
                content: 'AI is the new electricity. - Andrew Ng'
            },
            {
                type: 'paragraph',
                content: 'As we look to the future, the integration of AI into daily workflows will become seamless.'
            }
        ],
        relatedLinks: [
            {
                title: 'Understanding Attention Mechanisms',
                url: '#',
                sourceType: 'internal'
            },
            {
                title: 'OpenAI Blog',
                url: 'https://openai.com/blog',
                sourceType: 'external'
            }
        ]
    };
}
