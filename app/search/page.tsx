"use client";

import { useState, FormEvent } from "react";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SITE_SEARCH_URL = "https://www.google.com/search";

export default function SearchPage() {
  const [q, setQ] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!q.trim()) return;
    const params = new URLSearchParams({
      q: `site:ghostmammothpbc.com ${q.trim()}`,
    });
    window.open(`${SITE_SEARCH_URL}?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
        <p className="text-muted-foreground mb-8">
          Search this site using Google. Results open in a new tab.
        </p>
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-q">Search terms</Label>
            <Input
              id="search-q"
              type="search"
              placeholder="e.g. events, membership"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="text-base"
              autoComplete="off"
              aria-describedby="search-desc"
            />
            <p id="search-desc" className="text-sm text-muted-foreground">
              Results will open in a new window.
            </p>
          </div>
          <Button type="submit" disabled={!q.trim()}>
            Search site
          </Button>
        </form>
      </main>
    </div>
  );
}
