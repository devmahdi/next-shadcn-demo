"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  currentUrl?: string;
  compact?: boolean;
}

export function ImageUpload({ onUpload, label = "Upload Image", currentUrl, compact }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
      } else {
        const data = await res.json();
        onUpload(data.url);
      }
    } catch {
      setError("Network error");
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-4 w-4" /> {label}</>
          )}
        </Button>
        {currentUrl && !compact && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{currentUrl.split("/").pop()}</span>
          </div>
        )}
      </div>
      {currentUrl && !compact && (
        <div className="rounded-md overflow-hidden border w-32 h-20">
          <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
