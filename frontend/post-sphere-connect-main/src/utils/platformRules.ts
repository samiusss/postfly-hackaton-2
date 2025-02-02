interface PlatformRules {
    maxLength: number;
    hashtagLimit: number;
    formatting: {
        lineBreaksAllowed: boolean;
        emojiRecommended: boolean;
        mentionsAllowed: boolean;
    };
    contentGuidelines: string[];
}
export const platformRules: Record<string, PlatformRules> = {
    twitter: {
        maxLength: 280,
        hashtagLimit: 3,
        formatting: {
            lineBreaksAllowed: true,
            emojiRecommended: true,
            mentionsAllowed: true,
        },
        contentGuidelines: [
            "Short and concise",
            "Use relevant hashtags",
            "Engage with questions",
            "Include call-to-actions",
        ],
    },
    instagram: {
        maxLength: 2200,
        hashtagLimit: 30,
        formatting: {
            lineBreaksAllowed: true,
            emojiRecommended: true,
            mentionsAllowed: true,
        },
        contentGuidelines: [
            "Visual-first description",
            "Use line breaks for readability",
            "Group hashtags at the end",
            "Include emojis for engagement",
        ],
    },
    facebook: {
        maxLength: 63206,
        hashtagLimit: 5,
        formatting: {
            lineBreaksAllowed: true,
            emojiRecommended: false,
            mentionsAllowed: true,
        },
        contentGuidelines: [
            "Longer, more detailed content",
            "Focus on storytelling",
            "Minimal hashtag usage",
            "Include rich context",
        ],
    },
};
