import { createPost } from "./db";

interface TrendingTopic {
  title: string;
  description: string;
  url?: string;
}

export async function generateContentFromTrends(): Promise<{ success: boolean; count: number; topics: string[] }> {
  try {
    // Search for trending topics (using a simple approach - in production you'd use Twitter API, Google Trends API, etc.)
    const trendSearches = [
      "trending technology news today",
      "popular tech topics this week",
    ];

    const topics: TrendingTopic[] = [];
    
    // For MVP, we'll generate 2 generic trending topics
    // In production, you'd integrate with real trending APIs
    const sampleTopics = [
      {
        title: "The Rise of AI Agents in Software Development",
        description: "How AI agents are transforming the way developers build and deploy applications",
      },
      {
        title: "Next.js 15: What's New and Why It Matters",
        description: "Exploring the latest features and improvements in Next.js 15",
      },
    ];

    topics.push(...sampleTopics);

    const generatedPosts: string[] = [];
    const ADMIN_USER_ID = 1; // Admin user who created the cron

    for (const topic of topics.slice(0, 2)) {
      const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const excerpt = topic.description;
      
      // Generate basic content structure
      const content = `## Introduction

${topic.description}

## Key Points

- Point 1: [To be expanded by Content Creator]
- Point 2: [To be expanded by Content Creator]
- Point 3: [To be expanded by Content Creator]

## Conclusion

[Summary to be added by Content Creator]

---
*This draft was auto-generated based on trending topics. Please review and expand before publishing.*`;

      try {
        const post = createPost(
          `[DRAFT] ${topic.title}`,
          `${slug}-${Date.now()}`,
          excerpt,
          content,
          ADMIN_USER_ID,
          0, // unpublished
          undefined // no cover image
        );
        generatedPosts.push(post.title);
      } catch (err) {
        console.error(`Failed to create draft for "${topic.title}":`, err);
      }
    }

    return {
      success: true,
      count: generatedPosts.length,
      topics: generatedPosts,
    };
  } catch (error) {
    console.error("Content generation error:", error);
    return { success: false, count: 0, topics: [] };
  }
}
