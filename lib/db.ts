import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

// Database path - configurable via env var for production
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "app.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        cover_image TEXT,
        published INTEGER NOT NULL DEFAULT 0,
        author_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      );

      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
      CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
    `);

    // Migration: add role column if missing (for existing DBs)
    try {
      db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
    } catch {
      // Column already exists, ignore
    }
  }
  return db;
}

// Password hashing using Node.js crypto (no external deps needed)
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, s, 10000, 64, "sha512").toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const result = hashPassword(password, salt);
  return result.hash === hash;
}

// Simple JWT-like token (using HMAC for demo purposes)
const SECRET = process.env.AUTH_SECRET || "next-demo-secret-change-in-production";

export function createToken(userId: number, email: string, role: string = "user"): string {
  const payload = JSON.stringify({ userId, email, role, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    const [encoded, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
    if (sig !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp < Date.now()) return null;

    return { userId: payload.userId, email: payload.email, role: payload.role || "user" };
  } catch {
    return null;
  }
}

// User CRUD
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  published: number;
  author_id: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export function createUser(name: string, email: string, password: string, role: string = "user"): User {
  const db = getDb();
  const { hash, salt } = hashPassword(password);

  const stmt = db.prepare(
    "INSERT INTO users (name, email, password_hash, salt, role) VALUES (?, ?, ?, ?, ?)"
  );
  const result = stmt.run(name, email.toLowerCase(), hash, salt, role);

  return {
    id: result.lastInsertRowid as number,
    name,
    email: email.toLowerCase(),
    role,
    created_at: new Date().toISOString(),
  };
}

export function findUserByEmail(email: string) {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as
    | (User & { password_hash: string; salt: string })
    | undefined;
}

// Seed default admin if not exists
export function seedAdmin() {
  const db = getDb();
  const admin = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@admin.com");
  if (!admin) {
    createUser("Admin", "admin@admin.com", "admin123", "admin");
  }
}

// Blog CRUD
export function createPost(title: string, slug: string, excerpt: string, content: string, authorId: number, published: number = 0, coverImage?: string): Post {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO posts (title, slug, excerpt, content, author_id, published, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const result = stmt.run(title, slug, excerpt, content, authorId, published, coverImage || null);
  return db.prepare("SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?").get(result.lastInsertRowid) as Post;
}

export function updatePost(id: number, data: { title?: string; slug?: string; excerpt?: string; content?: string; published?: number; cover_image?: string }): Post | null {
  const db = getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
  }
  if (fields.length === 0) return null;
  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  db.prepare(`UPDATE posts SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return db.prepare("SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?").get(id) as Post;
}

export function deletePost(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getPostBySlug(slug: string): Post | undefined {
  const db = getDb();
  return db.prepare("SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.slug = ?").get(slug) as Post | undefined;
}

export function getPublishedPosts(): Post[] {
  const db = getDb();
  return db.prepare("SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.published = 1 ORDER BY p.created_at DESC").all() as Post[];
}

export function getAllPosts(): Post[] {
  const db = getDb();
  return db.prepare("SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC").all() as Post[];
}

export function getPostById(id: number): Post | undefined {
  const db = getDb();
  return db.prepare("SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?").get(id) as Post | undefined;
}
