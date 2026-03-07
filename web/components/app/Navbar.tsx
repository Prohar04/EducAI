"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Home, BookOpen, Sparkles, Bookmark, Award, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Session } from "@/types/auth.type";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const NAV_LINKS = [
  { href: "/app/home", label: "Home", icon: Home },
  { href: "/app", label: "Dashboard", icon: GraduationCap },
  { href: "/app/programs", label: "Programs", icon: BookOpen },
  { href: "/app/match", label: "Match", icon: Sparkles },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
  { href: "/app/scholarships", label: "Scholarships", icon: Award },
] as const;

export function Navbar({ user }: { user: Session["user"] }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/signout", { method: "POST" });
    router.push("/auth/signin");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="App navigation"
      >
        {/* Logo */}
        <Link href="/app/home" className="flex items-center gap-2 shrink-0">
          <GraduationCap className="size-7 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            Educ<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="size-7">
                <AvatarImage src={user.avatarUrl?.trim() || undefined} alt={user.name} />
                <AvatarFallback>{getInitials(user.name || user.email || "U")}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm sm:block">
                {user.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/onboarding" className="cursor-pointer">
                <User className="mr-2 size-4" />
                Edit Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
