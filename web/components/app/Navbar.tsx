"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, Search, Award, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Session } from "@/types/auth.type";

const NAV_LINKS = [
  { href: "/app", label: "Dashboard", icon: GraduationCap },
  { href: "/app/programs", label: "Programs", icon: BookOpen },
  { href: "/app/search", label: "Search", icon: Search },
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
        <Link href="/app" className="flex items-center gap-2 shrink-0">
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
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
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
