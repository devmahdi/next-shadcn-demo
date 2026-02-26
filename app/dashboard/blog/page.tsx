"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Code2, LogOut, ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, Save, X, ImagePlus, Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/image-upload";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  published: number;
  author_name: string;
  created_at: string;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image: "", published: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/auth"); return; }
    try {
      const u = JSON.parse(userData);
      if (u.role !== "admin") { router.push("/dashboard"); return; }
      setUser(u);
      loadPosts(token);
    } catch { router.push("/auth"); }
  }, [router]);

  async function loadPosts(token?: string) {
    const t = token || localStorage.getItem("token");
    const res = await fetch("/api/posts", { headers: { authorization: `Bearer ${t}`, "x-admin": "true" } });
    setPosts(await res.json());
    setLoading(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", published: false });
    setError("");
  }

  function startEdit(post: Post) {
    setEditing(post);
    setCreating(false);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.cover_image || "",
      published: post.published === 1,
    });
    setError("");
  }

  function cancel() {
    setCreating(false);
    setEditing(null);
    setError("");
  }

  function autoSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    const body = { ...form, published: form.published ? 1 : 0 };

    try {
      let res;
      if (editing) {
        res = await fetch(`/api/posts/${editing.id}`, {
          method: "PUT",
          headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/posts", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
      } else {
        cancel();
        loadPosts();
      }
    } catch {
      setError("Network error");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this post?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    loadPosts();
  }

  async function togglePublish(post: Post) {
    const token = localStorage.getItem("token");
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: post.published === 1 ? 0 : 1 }),
    });
    loadPosts();
  }

  async function handleGenerateContent() {
    setGenerating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✨ ${data.message}\n\nTopics:\n${data.topics.map((t: string) => `• ${t}`).join("\n")}\n\nCheck the post list below!`);
        loadPosts();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch {
      alert("Network error");
    }
    setGenerating(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const showForm = creating || editing;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Code2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">NextDemo</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" /> Dashboard</Button>
            </Link>
            <h1 className="text-2xl font-bold">Blog Management</h1>
          </div>
          {!showForm && (
            <div className="flex gap-2">
              <Button onClick={handleGenerateContent} variant="outline" disabled={generating} className="gap-2">
                <Sparkles className="h-4 w-4" />
                {generating ? "Generating..." : "Generate Content"}
              </Button>
              <Button onClick={startCreate} className="gap-2">
                <Plus className="h-4 w-4" /> New Post
              </Button>
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editing ? "Edit Post" : "Create New Post"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((f) => ({
                        ...f,
                        title,
                        slug: creating ? autoSlug(title) : f.slug,
                      }));
                    }}
                    placeholder="My Awesome Post"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="my-awesome-post"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Input
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="A short summary of your post..."
                />
              </div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="flex items-center gap-3">
                  <ImageUpload
                    label="Upload Cover"
                    currentUrl={form.cover_image || undefined}
                    onUpload={(url) => setForm((f) => ({ ...f, cover_image: url }))}
                  />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Input
                    value={form.cover_image}
                    onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                    placeholder="Paste URL..."
                    className="flex-1"
                  />
                </div>
                {form.cover_image && (
                  <div className="rounded-md overflow-hidden border w-full max-w-xs h-32 mt-2">
                    <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Content</Label>
                  <ImageUpload
                    label="Insert Image"
                    compact
                    onUpload={(url) => {
                      const imgTag = `\n<img src="${url}" alt="image" style="max-width:100%;border-radius:8px;margin:16px 0" />\n`;
                      setForm((f) => ({ ...f, content: f.content + imgTag }));
                    }}
                  />
                </div>
                <textarea
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write your blog post content here. Use 'Insert Image' to add images inline..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving || !form.title || !form.slug} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : editing ? "Update Post" : "Create Post"}
                </Button>
                <Button variant="outline" onClick={cancel} className="gap-2">
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4"><div className="h-6 bg-muted rounded w-1/3" /></CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-4">No blog posts yet.</p>
            <Button onClick={startCreate} className="gap-2"><Plus className="h-4 w-4" /> Create Your First Post</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{post.title}</h3>
                      <Badge variant={post.published === 1 ? "default" : "secondary"}>
                        {post.published === 1 ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      /{post.slug} · {post.author_name} · {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => togglePublish(post)} title={post.published ? "Unpublish" : "Publish"}>
                      {post.published === 1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(post)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
