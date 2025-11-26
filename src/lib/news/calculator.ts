export function calculateReadTime(text: string): number {
    const wordsPerMinute = 200; // English standard
    const charsPerMinute = 600; // Japanese standard

    // Simple detection for Japanese characters
    const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);

    if (isJapanese) {
        const charCount = text.replace(/\s/g, '').length;
        const minutes = Math.ceil(charCount / charsPerMinute);
        return minutes < 1 ? 1 : minutes;
    } else {
        const wordCount = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return minutes < 1 ? 1 : minutes;
    }
}
