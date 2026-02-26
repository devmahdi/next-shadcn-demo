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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
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

export function createToken(userId: number, email: string): string {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const [encoded, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
    if (sig !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp < Date.now()) return null;

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

// User CRUD
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export function createUser(name: string, email: string, password: string): User {
  const db = getDb();
  const { hash, salt } = hashPassword(password);

  const stmt = db.prepare(
    "INSERT INTO users (name, email, password_hash, salt) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(name, email.toLowerCase(), hash, salt);

  return {
    id: result.lastInsertRowid as number,
    name,
    email: email.toLowerCase(),
    created_at: new Date().toISOString(),
  };
}

export function findUserByEmail(email: string) {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as
    | (User & { password_hash: string; salt: string })
    | undefined;
}
