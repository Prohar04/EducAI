"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Bell,
  Menu,
  X,
  TrendingUp,
  Plane,
  RefreshCw,
  Zap,
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
import { getUnifiedNotifications, type AppNotification, type NotificationType } from "@/lib/auth/action";

const ACTIVE_PILL_CLASS =
  "bg-primary/12 text-primary shadow-[0_0_0_1px_rgba(220,161,62,0.24),0_12px_30px_-18px_rgba(220,161,62,0.8)]";
const INACTIVE_PILL_CLASS =
  "text-muted-foreground hover:bg-muted/60 hover:text-foreground";

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

const NAV_LINKS = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/programs", label: "Programs", icon: BookOpen },
  { href: "/app/match", label: "Match", icon: Sparkles },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
] as const;

const TOOLS = [
  { href: "/app/timeline", label: "Timeline", icon: CalendarDays, soon: false },
  { href: "/app/strategy", label: "Strategy", icon: Target, soon: false },
  { href: "/app/scholarships", label: "Scholarships", icon: Award, soon: false },
  { href: "/app/sop", label: "SOP Builder", icon: FileText, soon: false },
  { href: "/app/cv", label: "CV Builder", icon: ClipboardList, soon: false },
  { href: "/app/professors", label: "Professor Finder", icon: Users, soon: false },
  { href: "/app/gap-fix", label: "Gap Fix", icon: Zap, soon: false },
  { href: "/app/career", label: "Career Outlook", icon: TrendingUp, soon: false },
  { href: "/app/immigration", label: "Immigration", icon: Plane, soon: false },
  { href: "/app/data-sync", label: "Data Freshness", icon: RefreshCw, soon: false },
] as const;

const TOOL_GROUPS = [
  {
    label: "Planning",
    tools: ["/app/timeline", "/app/strategy", "/app/scholarships"],
  },
  {
    label: "Application",
    tools: ["/app/sop", "/app/cv", "/app/professors", "/app/gap-fix"],
  },
  {
    label: "Guidance",
    tools: ["/app/career", "/app/immigration", "/app/data-sync"],
  },
] as const;

function NotifIcon({ type }: { type: NotificationType }) {
  const classes = "mt-0.5 size-4 shrink-0";
  switch (type) {
    case "scholarship_alert":
      return <Award className={`${classes} text-amber-500`} />;
    case "profile_incomplete":
      return <User className={`${classes} text-blue-500`} />;
    case "match_ready":
      return <Sparkles className={`${classes} text-primary`} />;
    case "sop_ready":
      return <FileText className={`${classes} text-emerald-500`} />;
    case "cv_ready":
      return <ClipboardList className={`${classes} text-emerald-500`} />;
    default:
      return <Bell className={`${classes} text-muted-foreground`} />;
  }
}

export function Navbar({ user }: { user: Session["user"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [modulesOpen, setModulesOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifsLoaded, setNotifsLoaded] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getUnifiedNotifications();
      setNotifications(data);
    } catch {
      // Non-critical — fail silently
    } finally {
      setNotifsLoaded(true);
    }
  }, []);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  function markAllRead() {
    setReadIds(new Set(notifications.map(n => n.id)));
  }

  // Load notifications when panel opens for the first time
  useEffect(() => {
    if (alertsOpen && !notifsLoaded) {
      loadNotifications();
    }
  }, [alertsOpen, notifsLoaded, loadNotifications]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await fetch("/api/signout", { method: "POST" });
    router.push("/auth/signin");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/app/dashboard") {
      return (
        pathname === "/app" ||
        pathname === "/app/dashboard" ||
        pathname.startsWith("/app/dashboard/")
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isToolsActive = TOOLS.some((m) => isActive(m.href));

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-xl backdrop-saturate-150">
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
          <ul className="hidden items-center gap-2 lg:flex" role="list">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      active ? ACTIVE_PILL_CLASS : INACTIVE_PILL_CLASS
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}

            <li>
              <DropdownMenu open={modulesOpen} onOpenChange={setModulesOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isToolsActive ? ACTIVE_PILL_CLASS : INACTIVE_PILL_CLASS
                    }`}
                  >
                    Tools
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
                  className="w-64 rounded-2xl border-border/60 bg-background/97 p-2 shadow-[0_20px_48px_-20px_rgba(0,0,0,0.45)]"
                  sideOffset={6}
                >
                  {TOOL_GROUPS.map((group, gi) => {
                    const groupTools = TOOLS.filter((t) => (group.tools as readonly string[]).includes(t.href));
                    return (
                      <div key={group.label}>
                        {gi > 0 && <DropdownMenuSeparator className="my-1.5" />}
                        <p className="mb-1 px-3 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                          {group.label}
                        </p>
                        {groupTools.map(({ href, label, icon: Icon, soon }) => {
                          const active = isActive(href);
                          return (
                            <DropdownMenuItem
                              key={href}
                              asChild
                              className={`rounded-lg p-0 transition-colors ${active ? "focus:bg-transparent" : "focus:bg-muted/60"}`}
                            >
                              <Link
                                href={href}
                                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                                  active
                                    ? `${ACTIVE_PILL_CLASS} bg-primary/10`
                                    : "text-foreground/90 hover:bg-muted/60"
                                }`}
                              >
                                <Icon className={`size-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="flex-1 text-[13px]">{label}</span>
                                {soon && (
                                  <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                                    Soon
                                  </span>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>

          {/* Right side: notifications + user + mobile toggle */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notification Bell */}
            <DropdownMenu open={alertsOpen} onOpenChange={setAlertsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative size-9" aria-label="Notifications">
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div>
                    <p className="text-sm font-semibold">Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {!notifsLoaded ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <Bell className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No notifications right now</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Deadline alerts and updates will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((notif) => {
                      const isRead = readIds.has(notif.id);
                      return (
                        <DropdownMenuItem key={notif.id} asChild className="rounded-xl p-0">
                          <Link
                            href={notif.href}
                            onClick={() => setReadIds(prev => new Set([...prev, notif.id]))}
                            className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${isRead ? "opacity-60" : ""}`}
                          >
                            <NotifIcon type={notif.type} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-1">
                                <p className={`truncate font-medium ${isRead ? "" : "text-foreground"}`}>
                                  {notif.title}
                                </p>
                                {!isRead && (
                                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {notif.body}
                              </p>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu (desktop) */}
            <div className="hidden lg:block">
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
            </div>

            {/* Mobile: avatar + hamburger */}
            <div className="flex items-center gap-1 lg:hidden">
              <NavAvatar user={user} />
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed right-0 top-0 z-50 h-full w-72 max-w-[85vw] overflow-y-auto border-l border-border bg-background shadow-2xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>

              {/* Nav links */}
              <div className="p-3 space-y-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Navigation
                </p>
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className={`size-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* Tools section */}
              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={() => setMobileToolsOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  Tools
                  <motion.span
                    animate={{ rotate: mobileToolsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex" }}
                  >
                    <ChevronDown className="size-3.5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {mobileToolsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pt-1">
                        {TOOLS.map(({ href, label, icon: Icon, soon }) => {
                          const active = isActive(href);
                          return (
                            <Link
                              key={href}
                              href={href}
                              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                              }`}
                            >
                              <Icon className={`size-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                              <span className="flex-1">{label}</span>
                              {soon && (
                                <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary">
                                  Soon
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="mx-3 border-t border-border" />

              {/* Account actions */}
              <div className="p-3 space-y-1">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </p>
                <Link
                  href="/app/profile"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-foreground transition-colors"
                >
                  <User className="size-4 shrink-0 text-muted-foreground" />
                  Edit Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="size-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
