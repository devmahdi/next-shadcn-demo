"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Code2, LogOut, Home, Activity, Users, FolderOpen, FileText } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth");
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push("/auth");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">NextDemo</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your account.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FolderOpen, label: "Projects", value: "3", color: "blue" },
            { icon: Activity, label: "Active Tasks", value: "12", color: "green" },
            { icon: Users, label: "Team Members", value: "5", color: "purple" },
            { icon: Home, label: "Deployments", value: "28", color: "orange" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">Create Project</Button>
            <Button variant="outline" size="sm">Invite Member</Button>
            <Button variant="outline" size="sm">View Analytics</Button>
            {user.role === "admin" && (
              <Link href="/dashboard/blog">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Manage Blog
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="h-3.5 w-3.5" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
