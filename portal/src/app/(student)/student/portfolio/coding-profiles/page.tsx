"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Plus,
  RefreshCw,
  ExternalLink,
  Code2,
  Trophy,
  Target,
  Star,
  Trash2,
  Edit3,
  BarChart3,
  Award,
  Sparkles,
  GitBranch,
  Layers,
  ChevronRight,
  Calendar,
  Compass,
  Lock,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingGrid } from "@/components/ui/loading-states";
import { Progress } from "@/components/ui/progress";
import { EnhancedEmpty } from "@/components/ui/enhanced-empty";
import { PageHeader } from "@/components/layout/page-header";
import { Heading } from "@/components/ui/heading";
import { StatCounter } from "@/components/ui/StatCounter";
import { cn } from "@/lib/utils";
import { ComprehensiveStats } from "@/services/stats.service";

interface CodingProfile {
  id: string;
  platform: string;
  username: string;
  profileUrl?: string;
  statsJSON: string;
  isPrimary: boolean;
  monthlyGoal: number;
  practiceFrequency?: string;
  lastFetched: string;
  createdAt?: string;
  updatedAt?: string;
}

// Supported platforms with live stat fetchers
const PLATFORMS = [
  {
    id: "LeetCode",
    name: "LeetCode",
    color: "#FFA116",
    bg: "bg-[#FFA116]/10",
    border: "border-[#FFA116]/30",
    text: "text-[#FFA116]",
    defaultUrl: (u: string) => `https://leetcode.com/u/${u}`
  },
  {
    id: "GitHub",
    name: "GitHub",
    color: "#24292e",
    bg: "bg-slate-900/10 dark:bg-slate-100/10",
    border: "border-slate-400/30",
    text: "text-slate-900 dark:text-slate-100",
    defaultUrl: (u: string) => `https://github.com/${u}`
  },
  {
    id: "Codeforces",
    name: "Codeforces",
    color: "#1F8ACB",
    bg: "bg-[#1F8ACB]/10",
    border: "border-[#1F8ACB]/30",
    text: "text-[#1F8ACB]",
    defaultUrl: (u: string) => `https://codeforces.com/profile/${u}`
  },
  {
    id: "CodeChef",
    name: "CodeChef",
    color: "#5B4638",
    bg: "bg-[#5B4638]/10",
    border: "border-[#5B4638]/30",
    text: "text-[#5B4638] dark:text-amber-400",
    defaultUrl: (u: string) => `https://www.codechef.com/users/${u}`
  },
  {
    id: "GeeksforGeeks",
    name: "GeeksforGeeks",
    color: "#2F8D46",
    bg: "bg-[#2F8D46]/10",
    border: "border-[#2F8D46]/30",
    text: "text-[#2F8D46]",
    defaultUrl: (u: string) => `https://www.geeksforgeeks.org/user/${u}`
  },
  {
    id: "HackerRank",
    name: "HackerRank",
    color: "#00EA64",
    bg: "bg-[#00EA64]/10",
    border: "border-[#00EA64]/30",
    text: "text-[#00EA64]",
    defaultUrl: (u: string) => `https://www.hackerrank.com/profile/${u}`
  }
];

function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 4.977 3.518c.376.012.753-.012 1.129-.071a6.002 6.002 0 0 0 2.217-.857l3.855-4.127a1.379 1.379 0 0 0 .004-1.954 1.378 1.378 0 0 0-1.954-.004l-3.855 4.127a3.243 3.243 0 0 1-1.198.463 3.195 3.195 0 0 1-.61.039 3.18 3.18 0 0 1-2.677-1.892 2.977 2.977 0 0 1-.188-.547 2.96 2.96 0 0 1-.034-1.27 2.83 2.83 0 0 1 .65-1.132l3.854-4.126 5.406-5.788A1.374 1.374 0 0 0 13.483 0zm4.254 7.64a1.378 1.378 0 0 0-.97.404l-2.827 2.828a1.379 1.379 0 1 0 1.95 1.95l2.828-2.828a1.378 1.378 0 0 0-.981-2.354zm-2.096 7.61a1.378 1.378 0 0 0-.98.404l-2.828 2.828a1.379 1.379 0 1 0 1.95 1.95l2.828-2.828a1.378 1.378 0 0 0-.97-2.354z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function CodeforcesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4.5 7.5a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-3 0v-11a1.5 1.5 0 0 1 1.5-1.5z" fill="#FFD400" />
      <path d="M12 3a1.5 1.5 0 0 1 1.5 1.5v15.5a1.5 1.5 0 0 1-3 0V4.5A1.5 1.5 0 0 1 12 3z" fill="#1F8ACB" />
      <path d="M19.5 11.5a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-3 0v-7a1.5 1.5 0 0 1 1.5-1.5z" fill="#FF1818" />
    </svg>
  );
}

function CodeChefIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.969 0C9.697 0 7.785 1.406 7.031 3.406A4.957 4.957 0 0 0 3.5 8c0 2.215 1.453 4.09 3.469 4.75-.016.25-.031.5-.031.75 0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5c0-.25-.016-.5-.031-.75 2.016-.66 3.469-2.535 3.469-4.75 0-2.316-1.594-4.246-3.719-4.75C20.898 1.406 18.986 0 16.714 0c-1.328 0-2.516.484-3.438 1.281A4.898 4.898 0 0 0 11.969 0zM14 10a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm2 4.5c1.78 0 3.25.96 3.75 2.31-.22.19-.48.33-.75.44-.38-.9-1.57-1.5-3-1.5s-2.62.6-3 1.5c-.27-.11-.53-.25-.75-.44.5-1.35 1.97-2.31 3.75-2.31z" />
    </svg>
  );
}

function GeeksforGeeksIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c.95 0 1.82.38 2.45 1l-1.05 1.05c-.38-.38-.88-.6-1.4-.6-1.13 0-2.05.92-2.05 2.05s.92 2.05 2.05 2.05c.87 0 1.55-.53 1.85-1.25H10.5V12h3.45c.07.28.1.58.1.9 0 1.99-1.46 3.6-3.55 3.6zm6.5 0c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c.95 0 1.82.38 2.45 1l-1.05 1.05c-.38-.38-.88-.6-1.4-.6-1.13 0-2.05.92-2.05 2.05s.92 2.05 2.05 2.05c.87 0 1.55-.53 1.85-1.25H15.5V12h3.45c.07.28.1.58.1.9 0 1.99-1.46 3.6-3.55 3.6z" />
    </svg>
  );
}

function HackerRankIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.5 17.5h-2.1v-4.1h-2.8v4.1H8.5v-11h2.1v4.3h2.8V6.5h2.1v11z" />
    </svg>
  );
}

function PlatformBrandIcon({ platform, className = "h-5 w-5" }: { platform: string; className?: string }) {
  const norm = platform.toLowerCase();
  if (norm === "leetcode") return <LeetCodeIcon className={cn(className, "text-[#FFA116]")} />;
  if (norm === "github") return <GitHubIcon className={cn(className, "text-foreground")} />;
  if (norm === "codeforces") return <CodeforcesIcon className={className} />;
  if (norm === "codechef") return <CodeChefIcon className={cn(className, "text-[#5B4638] dark:text-amber-400")} />;
  if (norm === "geeksforgeeks" || norm === "gfg") return <GeeksforGeeksIcon className={cn(className, "text-[#2F8D46]")} />;
  if (norm === "hackerrank") return <HackerRankIcon className={cn(className, "text-[#00EA64]")} />;
  return <Code2 className={cn(className, "text-brown-800 dark:text-amber-400")} />;
}

function getPlatformMeta(platformName: string) {
  const p = PLATFORMS.find(
    (item) => item.id.toLowerCase() === platformName.toLowerCase() || item.name.toLowerCase() === platformName.toLowerCase()
  );
  return (
    p || {
      id: platformName,
      name: platformName,
      color: "#512912",
      bg: "bg-brown-800/10",
      border: "border-brown-800/30",
      text: "text-brown-800",
      defaultUrl: () => ""
    }
  );
}

function parseStats(statsJSON: string): ComprehensiveStats {
  try {
    if (!statsJSON) return { totalSolved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
    return typeof statsJSON === "string" ? JSON.parse(statsJSON) : statsJSON;
  } catch {
    return { totalSolved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
  }
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "Not synced yet";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export default function CodingProfilesPage() {
  const [profiles, setProfiles] = useState<CodingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [detailProfile, setDetailProfile] = useState<CodingProfile | null>(null);
  const [editProfile, setEditProfile] = useState<CodingProfile | null>(null);

  // Add Form states
  const [addPlatform, setAddPlatform] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addProfileUrl, setAddProfileUrl] = useState("");
  const [addMonthlyGoal, setAddMonthlyGoal] = useState("30");
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Edit Form state (Only monthly target allowed)
  const [editMonthlyGoal, setEditMonthlyGoal] = useState("30");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await api.get("/portfolio/coding-profiles");
      setProfiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load coding profiles", variant: "destructive" });
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Update detailProfile when profiles state updates
  useEffect(() => {
    if (detailProfile) {
      const updated = profiles.find((p) => p.id === detailProfile.id);
      if (updated) setDetailProfile(updated);
    }
  }, [profiles]);

  // Compute available platforms that have not yet been added
  const availablePlatforms = useMemo(() => {
    const existingPlatforms = new Set(profiles.map((p) => p.platform.toLowerCase()));
    return PLATFORMS.filter((p) => !existingPlatforms.has(p.id.toLowerCase()));
  }, [profiles]);

  // Reset or initialize addPlatform when availablePlatforms changes
  useEffect(() => {
    if (availablePlatforms.length > 0) {
      if (!availablePlatforms.some((p) => p.id === addPlatform)) {
        setAddPlatform(availablePlatforms[0].id);
      }
    } else {
      setAddPlatform("");
    }
  }, [availablePlatforms, addPlatform]);

  // Sync All Profiles
  const handleSyncAll = async () => {
    try {
      setSyncingAll(true);
      const res = await api.post("/portfolio/coding-profiles/sync-all", {});
      if (Array.isArray(res)) {
        setProfiles(res);
      } else {
        await fetchProfiles();
      }
      toast({ title: "Synchronized", description: "All coding profiles refreshed with live statistics." });
    } catch (error) {
      toast({ title: "Sync failed", description: "Could not refresh all profiles. Try refreshing individually.", variant: "destructive" });
    } finally {
      setSyncingAll(false);
    }
  };

  // Single Profile Refresh
  const handleRefreshSingle = async (profileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setRefreshingId(profileId);
      const updated = await api.post(`/portfolio/coding-profiles/${profileId}/refresh`, {});
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? updated : p)));
      if (detailProfile?.id === profileId) {
        setDetailProfile(updated);
      }
      toast({ title: "Profile Synced", description: "Latest statistics fetched successfully." });
    } catch (error) {
      toast({ title: "Refresh Error", description: "Failed to refresh stats from platform API.", variant: "destructive" });
    } finally {
      setRefreshingId(null);
    }
  };

  // Add Profile
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPlatform || !addUsername.trim()) {
      toast({ title: "Required Fields", description: "Please enter both Platform and Username", variant: "destructive" });
      return;
    }

    try {
      setAddSubmitting(true);
      const meta = getPlatformMeta(addPlatform);
      const computedUrl = addProfileUrl.trim() || meta.defaultUrl(addUsername.trim());

      const res = await api.post("/portfolio/coding-profiles", {
        platform: addPlatform,
        username: addUsername.trim(),
        profileUrl: computedUrl,
        monthlyGoal: Math.max(0, parseInt(addMonthlyGoal) || 30)
      });

      setProfiles((prev) => [res, ...prev]);
      setAddOpen(false);
      resetAddForm();
      toast({ title: "Platform Connected", description: `Successfully added ${addPlatform} profile.` });
    } catch (error: any) {
      toast({
        title: "Failed to Add",
        description: error.response?.data?.error || "Could not connect platform. Please verify username.",
        variant: "destructive"
      });
    } finally {
      setAddSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setAddUsername("");
    setAddProfileUrl("");
    setAddMonthlyGoal("30");
  };

  // Open Edit Modal (Only for Monthly Target)
  const handleOpenEdit = (profile: CodingProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditProfile(profile);
    setEditMonthlyGoal(String(profile.monthlyGoal || 30));
  };

  // Save Edit (Only Monthly Target)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfile) return;

    try {
      setEditSubmitting(true);
      const goalNumber = Math.max(0, parseInt(editMonthlyGoal) || 0);

      const updated = await api.patch(`/portfolio/coding-profiles/${editProfile.id}`, {
        monthlyGoal: goalNumber
      });

      setProfiles((prev) =>
        prev.map((p) => (p.id === editProfile.id ? updated : p))
      );
      if (detailProfile?.id === editProfile.id) {
        setDetailProfile(updated);
      }
      setEditProfile(null);
      toast({ title: "Target Saved", description: `Monthly target updated to ${goalNumber} problems.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update target goal", variant: "destructive" });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Profile (Forbidden for LeetCode & GitHub)
  const handleDelete = async (profile: CodingProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const norm = profile.platform.toLowerCase();
    if (norm === "leetcode" || norm === "github") {
      toast({
        title: "Cannot Remove",
        description: `${profile.platform} is a required core profile and cannot be removed.`,
        variant: "destructive"
      });
      return;
    }

    const previous = [...profiles];
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    if (detailProfile?.id === profile.id) setDetailProfile(null);
    if (editProfile?.id === profile.id) setEditProfile(null);

    try {
      await api.delete(`/portfolio/coding-profiles/${profile.id}`);
      toast({ title: "Platform Removed", description: `${profile.platform} unlinked.` });
    } catch (error) {
      setProfiles(previous);
      toast({ title: "Error", description: "Failed to remove profile", variant: "destructive" });
    }
  };

  // Aggregated Overall Stats
  const aggregateMetrics = useMemo(() => {
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let peakRating = 0;
    let peakPlatform = "";
    let peakRankTitle = "";
    let totalMonthlyGoal = 0;
    let githubRepos = 0;
    let githubStars = 0;

    profiles.forEach((p) => {
      const stats = parseStats(p.statsJSON);
      if (p.platform.toLowerCase() === "github") {
        githubRepos = stats.publicRepos || stats.totalSolved || 0;
        githubStars = stats.totalStars || stats.medium || 0;
      } else {
        totalSolved += Number(stats.totalSolved) || 0;
        easySolved += Number(stats.easy) || 0;
        mediumSolved += Number(stats.medium) || 0;
        hardSolved += Number(stats.hard) || 0;
      }

      const rating = Number(stats.rating) || Number(stats.maxRating) || 0;
      if (rating > peakRating && p.platform.toLowerCase() !== "github") {
        peakRating = rating;
        peakPlatform = p.platform;
        peakRankTitle = stats.rankTitle || (stats.stars ? String(stats.stars) : "");
      }

      totalMonthlyGoal += Number(p.monthlyGoal) || 0;
    });

    const goalProgress = totalMonthlyGoal > 0 ? Math.min(100, Math.round((totalSolved / totalMonthlyGoal) * 100)) : 0;
    const totalDifficulties = easySolved + mediumSolved + hardSolved || 1;
    const easyPct = Math.round((easySolved / totalDifficulties) * 100);
    const medPct = Math.round((mediumSolved / totalDifficulties) * 100);
    const hardPct = Math.max(0, 100 - easyPct - medPct);

    return {
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      peakRating,
      peakPlatform,
      peakRankTitle,
      totalMonthlyGoal,
      goalProgress,
      githubRepos,
      githubStars,
      easyPct,
      medPct,
      hardPct
    };
  }, [profiles]);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Coding Profiles"
        description="Automated competitive programming statistics and developer activity synced directly from your handles."
        action={
          <div className="flex items-center gap-2.5">
            {profiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                disabled={syncingAll}
                className="flex items-center gap-2 border-brown-800/20 hover:bg-brown-800/5 text-xs font-semibold"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", syncingAll && "animate-spin text-brown-800 dark:text-amber-400")} />
                {syncingAll ? "Syncing All..." : "Sync All"}
              </Button>
            )}

            {availablePlatforms.length > 0 && (
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1.5 shadow-sm font-semibold text-xs cursor-pointer">
                    <Plus className="h-4 w-4" /> Add Platform
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg p-0 gap-0 border-border/80 shadow-xl overflow-hidden">
                  <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-500/10 text-amber-700 border border-amber-500/20">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold font-display text-foreground">
                          Connect Coding Platform
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                          Select a competitive programming profile to track problems solved, streaks, and ratings.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
                    {/* 1. Platform Quick Tiles */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Select Platform <span className="text-destructive">*</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {availablePlatforms.map((p) => {
                          const isSelected = addPlatform === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setAddPlatform(p.id);
                                const meta = getPlatformMeta(p.id);
                                if (addUsername) setAddProfileUrl(meta.defaultUrl(addUsername.trim()));
                              }}
                              className={cn(
                                "flex flex-col items-center justify-center gap-1.5 rounded-sm border p-3 text-xs font-semibold transition-all cursor-pointer",
                                isSelected
                                  ? "border-brown-800 bg-brown-800/10 text-brown-900 shadow-xs ring-1 ring-brown-800 dark:text-amber-400 dark:ring-amber-500"
                                  : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                              )}
                            >
                              <PlatformBrandIcon platform={p.id} className="h-5 w-5 shrink-0" />
                              <span className="truncate">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Username / Handle Input */}
                    <div className="space-y-1.5">
                      <Label htmlFor="username-input" className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Username / Handle <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="username-input"
                        value={addUsername}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAddUsername(val);
                          const meta = getPlatformMeta(addPlatform);
                          setAddProfileUrl(meta.defaultUrl(val.trim()));
                        }}
                        placeholder="e.g. tour_de_code"
                        required
                        className="h-10 rounded-sm bg-card border-border/80 font-mono text-sm"
                      />
                    </div>

                    {/* 3. Generated URL Display */}
                    {addProfileUrl && (
                      <div className="rounded-sm border border-border/60 bg-muted/25 px-3 py-2 text-xs flex items-center justify-between gap-2">
                        <span className="text-muted-foreground font-semibold shrink-0">Profile Link:</span>
                        <span className="font-mono text-[11px] text-brown-800 truncate" title={addProfileUrl}>
                          {addProfileUrl}
                        </span>
                      </div>
                    )}

                    {/* 4. Monthly Problem Goal */}
                    <div className="space-y-2">
                      <Label htmlFor="goal-input" className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                        <span>Monthly Target (Problems Solved)</span>
                        <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
                      </Label>
                      <Input
                        id="goal-input"
                        type="number"
                        min="0"
                        value={addMonthlyGoal}
                        onChange={(e) => setAddMonthlyGoal(e.target.value)}
                        placeholder="30"
                        className="h-10 rounded-sm bg-card border-border/80"
                      />

                      {/* Goal Quick Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-muted-foreground mr-1 uppercase tracking-wider">
                          Presets:
                        </span>
                        {["15", "30", "50", "100"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAddMonthlyGoal(preset)}
                            className={cn(
                              "rounded-sm border border-border/70 px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer",
                              addMonthlyGoal === preset
                                ? "bg-brown-800 text-white border-transparent"
                                : "bg-muted/40 text-muted-foreground hover:bg-amber-500/10 hover:text-brown-800"
                            )}
                          >
                            {preset} problems
                          </button>
                        ))}
                      </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-border/50 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAddOpen(false)}
                        disabled={addSubmitting}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addSubmitting || !addUsername.trim() || !addPlatform}
                        className="min-w-[140px] font-semibold cursor-pointer"
                      >
                        {addSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Connecting...
                          </span>
                        ) : (
                          "Connect Platform"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      {/* Aggregate Overview Banner */}
      {!loading && profiles.length > 0 && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Total Solved */}
            <Card className="border shadow-sm bg-card/80 backdrop-blur relative overflow-hidden group hover:border-brown-800/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Problems Solved
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-brown-800/10 dark:bg-amber-400/10 flex items-center justify-center text-brown-800 dark:text-amber-400">
                    <Code2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground">
                    <StatCounter value={aggregateMetrics.totalSolved} />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">across platforms</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {aggregateMetrics.easySolved} E
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                    {aggregateMetrics.mediumSolved} M
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                    {aggregateMetrics.hardSolved} H
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Peak Rating */}
            <Card className="border shadow-sm bg-card/80 backdrop-blur relative overflow-hidden group hover:border-amber-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Peak Rating
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Trophy className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground">
                    {aggregateMetrics.peakRating > 0 ? (
                      <StatCounter value={aggregateMetrics.peakRating} />
                    ) : (
                      "Active"
                    )}
                  </span>
                  {aggregateMetrics.peakPlatform && (
                    <Badge variant="secondary" className="text-[10px] font-semibold uppercase">
                      {aggregateMetrics.peakPlatform}
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-xs text-muted-foreground truncate font-medium">
                  {aggregateMetrics.peakRankTitle || `${profiles.length} connected platforms`}
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Developer Footprint / GitHub */}
            <Card className="border shadow-sm bg-card/80 backdrop-blur relative overflow-hidden group hover:border-slate-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Dev Repos & Stars
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <GitBranch className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground">
                    <StatCounter value={aggregateMetrics.githubRepos} />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Repositories</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> {aggregateMetrics.githubStars} Stars
                  </span>
                  <span>•</span>
                  <span>Open Source</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Monthly Goal Progress */}
            <Card className="border shadow-sm bg-card/80 backdrop-blur relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Monthly Target
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-foreground">
                    {aggregateMetrics.goalProgress}%
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {aggregateMetrics.totalSolved}/{aggregateMetrics.totalMonthlyGoal || 30}
                  </span>
                </div>
                <div className="mt-3">
                  <Progress value={aggregateMetrics.goalProgress} className="h-2 bg-muted" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Difficulty Segmented Bar */}
          {aggregateMetrics.totalSolved > 0 && (
            <div className="rounded-xl border bg-card/50 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-brown-800 dark:text-amber-400" />
                  <span className="font-semibold text-foreground">Problem Solving Distribution</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Easy: {aggregateMetrics.easyPct}% ({aggregateMetrics.easySolved})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Med: {aggregateMetrics.medPct}% ({aggregateMetrics.mediumSolved})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Hard: {aggregateMetrics.hardPct}% ({aggregateMetrics.hardSolved})
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-muted">
                <div
                  style={{ width: `${aggregateMetrics.easyPct}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Easy: ${aggregateMetrics.easySolved}`}
                />
                <div
                  style={{ width: `${aggregateMetrics.medPct}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`Medium: ${aggregateMetrics.mediumSolved}`}
                />
                <div
                  style={{ width: `${aggregateMetrics.hardPct}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Hard: ${aggregateMetrics.hardSolved}`}
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Platform Cards Section */}
      {loading ? (
        <LoadingGrid items={6} />
      ) : profiles.length === 0 ? (
        <EnhancedEmpty
          icon={Code2}
          title="No Coding Profiles Connected"
          description="Connect your LeetCode, GitHub, Codeforces, or CodeChef profiles to track your problem solving metrics and showcase your pedigree."
          action={
            availablePlatforms.length > 0
              ? {
                  label: "Connect Platform",
                  onClick: () => setAddOpen(true)
                }
              : undefined
          }
          variant="illustrated"
          className="mt-6"
        />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Heading variant="section-title" className="text-base font-bold flex items-center gap-2">
              <Compass className="h-4 w-4 text-brown-800 dark:text-amber-400" /> Connected Platforms ({profiles.length})
            </Heading>
            <span className="text-xs text-muted-foreground">Click any card to inspect detailed insights</span>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => {
              const meta = getPlatformMeta(profile.platform);
              const stats = parseStats(profile.statsJSON);
              const isSyncing = refreshingId === profile.id;
              const isGitHub = profile.platform.toLowerCase() === "github";
              const isCore = profile.platform.toLowerCase() === "leetcode" || isGitHub;

              const total = stats.totalSolved || 0;
              const goal = profile.monthlyGoal || 0;
              const progress = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;

              return (
                <Card
                  key={profile.id}
                  onClick={() => setDetailProfile(profile)}
                  className={cn(
                    "cursor-pointer group flex flex-col justify-between border transition-all duration-200 hover:shadow-md hover:border-brown-800/40 relative overflow-hidden bg-card",
                    profile.isPrimary && "border-amber-500/40 ring-1 ring-amber-500/20"
                  )}
                >
                  {/* Top accent strip */}
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: meta.color }}
                  />

                  <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Platform Brand Icon */}
                        <div
                          className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 border",
                            meta.bg,
                            meta.border
                          )}
                        >
                          <PlatformBrandIcon platform={profile.platform} className="h-6 w-6" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <CardTitle className="text-base font-bold truncate group-hover:text-brown-800 dark:group-hover:text-amber-400 transition-colors">
                              {profile.platform}
                            </CardTitle>
                            {isCore && (
                              <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
                                Core
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="truncate text-xs font-medium mt-0.5 font-mono">
                            @{profile.username}
                          </CardDescription>
                        </div>
                      </div>

                      {/* Quick Sync & Target Edit */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit Monthly Target"
                          onClick={(e) => handleOpenEdit(profile, e)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Refresh Stats"
                          onClick={(e) => handleRefreshSingle(profile.id, e)}
                          disabled={isSyncing}
                        >
                          <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin text-brown-800 dark:text-amber-400")} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 sm:px-5 py-2 flex-1 space-y-3.5">
                    {/* Platform Highlights */}
                    {isGitHub ? (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-muted/50 border">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Repos</span>
                          <span className="text-base font-extrabold">{stats.publicRepos || total}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50 border">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Stars</span>
                          <span className="text-base font-extrabold text-amber-500">{stats.totalStars || stats.medium || 0}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50 border">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Followers</span>
                          <span className="text-base font-extrabold">{stats.followers || stats.hard || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Rating & Solved Pill Row */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-semibold uppercase text-muted-foreground block">Solved</span>
                            <span className="text-2xl font-extrabold tracking-tight font-display">{total}</span>
                          </div>

                          {(stats.rating > 0 || stats.stars || stats.rankTitle) && (
                            <div className="text-right">
                              <span className="text-[11px] font-semibold uppercase text-muted-foreground block">Rating / Rank</span>
                              <div className="flex items-center gap-1 justify-end font-bold text-sm">
                                {stats.stars && <span className="text-amber-500">{stats.stars}</span>}
                                {stats.rating > 0 && <span className="text-foreground">{stats.rating}</span>}
                                {stats.rankTitle && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold ml-1">
                                    {stats.rankTitle}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Difficulty breakdown chips */}
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Easy {stats.easy || 0}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Med {stats.medium || 0}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            Hard {stats.hard || 0}
                          </span>
                          {stats.acceptanceRate ? (
                            <span className="ml-auto text-[11px] font-medium text-muted-foreground">
                              {stats.acceptanceRate}% acc
                            </span>
                          ) : null}
                        </div>

                        {/* Monthly Goal Progress */}
                        {goal > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                              <span>Target ({goal} problems)</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5 bg-muted" />
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>

                  <CardFooter className="px-4 sm:px-5 py-2.5 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-[11px]">Synced {formatRelativeTime(profile.lastFetched)}</span>

                    <div className="flex items-center gap-1 font-semibold text-brown-800 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      <span>View Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE DETAILED PROFILE MODAL                                     */}
      {/* ========================================================================= */}
      {detailProfile && (
        <Dialog open={!!detailProfile} onOpenChange={(open) => !open && setDetailProfile(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {(() => {
              const meta = getPlatformMeta(detailProfile.platform);
              const stats = parseStats(detailProfile.statsJSON);
              const isSyncing = refreshingId === detailProfile.id;
              const isGitHub = detailProfile.platform.toLowerCase() === "github";
              const isCore = detailProfile.platform.toLowerCase() === "leetcode" || isGitHub;
              const total = stats.totalSolved || 0;
              const goal = detailProfile.monthlyGoal || 0;
              const progress = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;

              return (
                <div className="flex flex-col">
                  {/* Modal Header Banner */}
                  <div
                    className="p-6 text-white relative overflow-hidden flex flex-col justify-between"
                    style={{
                      background: `linear-gradient(135deg, ${meta.color}ee, ${meta.color}99, #1e293b)`
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-lg shrink-0">
                          <PlatformBrandIcon platform={detailProfile.platform} className="h-8 w-8 text-white" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                              {detailProfile.platform}
                            </h2>
                            {isCore && (
                              <Badge className="bg-white/20 text-white border-white/30 font-bold text-[10px]">
                                Core Profile
                              </Badge>
                            )}
                          </div>
                          <p className="text-white/80 font-mono text-sm mt-0.5">@{detailProfile.username}</p>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRefreshSingle(detailProfile.id)}
                          disabled={isSyncing}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs font-semibold backdrop-blur"
                        >
                          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isSyncing && "animate-spin")} />
                          {isSyncing ? "Syncing..." : "Sync Live"}
                        </Button>

                        {detailProfile.profileUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs font-semibold backdrop-blur"
                          >
                            <a href={detailProfile.profileUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs text-white/80">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Last Synced: {formatRelativeTime(detailProfile.lastFetched)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 font-medium">
                        Target: {goal} problems / month
                      </span>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6">
                    {/* KPI Quick Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {isGitHub ? (
                        <>
                          <div className="p-3 rounded-xl bg-muted/50 border text-center">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Repositories</span>
                            <span className="text-2xl font-extrabold text-foreground">{stats.publicRepos || total}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 border text-center">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Stars</span>
                            <span className="text-2xl font-extrabold text-amber-500">{stats.totalStars || 0}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 border text-center">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Followers</span>
                            <span className="text-2xl font-extrabold text-foreground">{stats.followers || 0}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 border text-center">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Activity Rating</span>
                            <span className="text-2xl font-extrabold text-brown-800 dark:text-amber-400">{stats.rating || 0}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 rounded-xl bg-muted/50 border text-center">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Problems Solved</span>
                            <span className="text-2xl font-extrabold text-foreground">{total}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 border text-center">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Contest Rating</span>
                            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                              {stats.rating > 0 ? stats.rating : "—"}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 border text-center">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Global Rank</span>
                            <span className="text-lg font-bold text-foreground truncate block">
                              {stats.globalRank ? `#${stats.globalRank}` : "—"}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 border text-center">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Accuracy</span>
                            <span className="text-2xl font-extrabold text-foreground">
                              {stats.acceptanceRate ? `${stats.acceptanceRate}%` : "—"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Detailed Difficulty Distribution */}
                    {!isGitHub && (
                      <div className="rounded-xl border p-4 sm:p-5 space-y-4 bg-card">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm flex items-center gap-2">
                            <Layers className="h-4 w-4 text-brown-800 dark:text-amber-400" /> Difficulty Breakdown
                          </h3>
                          <span className="text-xs text-muted-foreground font-medium">{total} total solves</span>
                        </div>

                        <div className="space-y-3">
                          {/* Easy */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Easy
                              </span>
                              <span>
                                {stats.easy || 0} solves ({total > 0 ? Math.round(((stats.easy || 0) / total) * 100) : 0}%)
                              </span>
                            </div>
                            <Progress
                              value={total > 0 ? ((stats.easy || 0) / total) * 100 : 0}
                              className="h-2 bg-muted [&>div]:bg-emerald-500"
                            />
                          </div>

                          {/* Medium */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
                              </span>
                              <span>
                                {stats.medium || 0} solves ({total > 0 ? Math.round(((stats.medium || 0) / total) * 100) : 0}%)
                              </span>
                            </div>
                            <Progress
                              value={total > 0 ? ((stats.medium || 0) / total) * 100 : 0}
                              className="h-2 bg-muted [&>div]:bg-amber-500"
                            />
                          </div>

                          {/* Hard */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hard
                              </span>
                              <span>
                                {stats.hard || 0} solves ({total > 0 ? Math.round(((stats.hard || 0) / total) * 100) : 0}%)
                              </span>
                            </div>
                            <Progress
                              value={total > 0 ? ((stats.hard || 0) / total) * 100 : 0}
                              className="h-2 bg-muted [&>div]:bg-rose-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Platform Specific Insights */}
                    {isGitHub && stats.topLanguages && stats.topLanguages.length > 0 && (
                      <div className="rounded-xl border p-4 space-y-2.5 bg-card">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-brown-800 dark:text-amber-400" /> Top Languages & Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {stats.topLanguages.map((lang: string) => (
                            <Badge key={lang} variant="secondary" className="px-2.5 py-1 text-xs font-semibold">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Competitive Attributes */}
                    {(stats.rankTitle || stats.maxRating || stats.attendedContests || stats.topPercentage || stats.stars) && (
                      <div className="rounded-xl border p-4 space-y-3 bg-card">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-500" /> Badges & Achievements
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                          {stats.rankTitle && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Rank Title</span>
                              <span className="font-bold text-foreground">{stats.rankTitle}</span>
                            </div>
                          )}
                          {stats.stars && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Stars</span>
                              <span className="font-bold text-amber-500">{stats.stars}</span>
                            </div>
                          )}
                          {stats.maxRating && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Max Rating</span>
                              <span className="font-bold text-foreground">{stats.maxRating}</span>
                            </div>
                          )}
                          {stats.attendedContests !== undefined && stats.attendedContests > 0 && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Contests Attended</span>
                              <span className="font-bold text-foreground">{stats.attendedContests}</span>
                            </div>
                          )}
                          {stats.topPercentage !== undefined && stats.topPercentage > 0 && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Top Percentile</span>
                              <span className="font-bold text-emerald-600">Top {stats.topPercentage}%</span>
                            </div>
                          )}
                          {stats.badgesCount !== undefined && stats.badgesCount > 0 && (
                            <div className="p-2.5 rounded-lg bg-muted/40 border">
                              <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Badges Earned</span>
                              <span className="font-bold text-foreground">{stats.badgesCount} Badges</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Monthly Goal Tracker */}
                    {goal > 0 && (
                      <div className="rounded-xl border p-4 space-y-2.5 bg-card">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" /> Monthly Target Goal
                          </h3>
                          <span className="text-xs font-bold text-foreground">{progress}% Completed</span>
                        </div>
                        <Progress value={progress} className="h-2.5 bg-muted" />
                        <p className="text-xs text-muted-foreground">
                          {total >= goal
                            ? "🎉 Monthly goal achieved! Keep up the stellar practice streak."
                            : `${goal - total} more problems needed to reach this month's target.`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="border-t bg-muted/30 p-4 px-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleOpenEdit(detailProfile, e)}
                        className="text-xs font-semibold"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Monthly Target
                      </Button>
                    </div>

                    {!isCore ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(detailProfile)}
                        className="text-destructive hover:bg-destructive/10 text-xs font-semibold"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove Platform
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Lock className="h-3 w-3" /> Core profile
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* EDIT MONTHLY TARGET DIALOG (ONLY ALLOW EDITING MONTHLY TARGET)             */}
      {/* ========================================================================= */}
      {editProfile && (
        <Dialog open={!!editProfile} onOpenChange={(open) => !open && setEditProfile(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 font-display">
                <Target className="h-5 w-5 text-brown-800 dark:text-amber-400" />
                Edit Monthly Target for {editProfile.platform}
              </DialogTitle>
              <DialogDescription>
                Set the number of problems you aim to solve this month on {editProfile.platform}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-goal">Monthly Target (Problems)</Label>
                <Input
                  id="edit-goal"
                  type="number"
                  min="0"
                  value={editMonthlyGoal}
                  onChange={(e) => setEditMonthlyGoal(e.target.value)}
                  required
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground mr-1">Quick presets:</span>
                  {["15", "30", "50", "100", "150"].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMonthlyGoal(preset)}
                      className={cn(
                        "h-6 px-2 text-[11px] font-medium",
                        editMonthlyGoal === preset && "bg-brown-800 text-white dark:bg-amber-400 dark:text-slate-900 border-transparent"
                      )}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditProfile(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? "Saving..." : "Save Target"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
