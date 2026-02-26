"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  author_name: string;
  created_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((posts: Post[]) => {
        const found = posts.find((p) => p.slug === params.slug);
        if (found) setPost(found);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-3xl animate-pulse">
          <div className="h-10 bg-muted rounded w-3/4 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2 mb-8" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog">
            <Button><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>
        </Link>

        {post.cover_image && (
          <div className="rounded-xl overflow-hidden mb-8 h-64 md:h-96">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <Badge variant="outline" className="mb-4">Blog Post</Badge>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author_name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br/>") }}
        />
      </article>
    </div>
  );
}
