"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Bookmark,
  Award,
  FileText,
  ClipboardList,
  Users,
  LogOut,
  User,
  ChevronDown,
  CalendarDays,
  Target,
} from "lucide-react";
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

async function md5Hex(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function gravatarUrl(email: string, hash: string): string {
  return `https://www.gravatar.com/avatar/${hash}?s=64&d=mp&r=g`;
}

// Top-level navigation links
const NAV_LINKS = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/programs", label: "Programs", icon: BookOpen },
  { href: "/app/match", label: "Match", icon: Sparkles },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
] as const;

// Module dropdown items — AI Agent is surfaced via the floating widget
const MODULES = [
  { href: "/app/scholarships", label: "Scholarships", icon: Award, soon: false },
  { href: "/app/timeline", label: "Timeline", icon: CalendarDays, soon: false },
  { href: "/app/strategy", label: "Strategy", icon: Target, soon: false },
  { href: "/app/sop", label: "SOP Builder", icon: FileText, soon: true },
  { href: "/app/cv", label: "CV Builder", icon: ClipboardList, soon: true },
  { href: "/app/professors", label: "Professors", icon: Users, soon: true },
] as const;

export function Navbar({ user }: { user: Session["user"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [modulesOpen, setModulesOpen] = useState(false);

  const handleSignOut = async () => {
    await fetch("/api/signout", { method: "POST" });
    router.push("/auth/signin");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isModulesActive = MODULES.some((m) => isActive(m.href));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="App navigation"
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <GraduationCap className="size-7 text-primary transition-transform duration-200 group-hover:scale-110" />
          <span className="text-lg font-bold tracking-tight">
            Educ<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-0.5 lg:flex" role="list">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-primary"
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}

          {/* Modules dropdown */}
          <li>
            <DropdownMenu open={modulesOpen} onOpenChange={setModulesOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isModulesActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Modules
                  <motion.span
                    animate={{ rotate: modulesOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{ display: "flex" }}
                  >
                    <ChevronDown className="size-3.5" />
                  </motion.span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-52 p-1"
                sideOffset={6}
              >
                {MODULES.map(({ href, label, icon: Icon, soon }) => {
                  const active = isActive(href);
                  return (
                    <DropdownMenuItem key={href} asChild>
                      <Link
                        href={href}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                          active ? "text-primary" : ""
                        }`}
                      >
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1">{label}</span>
                        {soon && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary">
                            Soon
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <NavAvatar user={user} />
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
              <Link href="/app/profile" className="cursor-pointer">
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

// ── Avatar with Google photo → Gravatar → initials fallback ──────────────────

function NavAvatar({ user }: { user: Session["user"] }) {
  const [src, setSrc] = useState<string | null>(user.avatarUrl?.trim() || null);

  useEffect(() => {
    if (!user.avatarUrl?.trim() && user.email) {
      md5Hex(user.email).then((hash) => {
        setSrc(gravatarUrl(user.email, hash));
      });
    }
  }, [user.avatarUrl, user.email]);

  const initials = getInitials(user.name || user.email || "U");

  return (
    <Avatar className="size-7">
      {src ? (
        <AvatarImage
          src={src}
          alt={user.name ?? "Avatar"}
          onError={() => setSrc(null)}
        />
      ) : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
