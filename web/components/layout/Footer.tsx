import Link from "next/link";
import { Mail, Github, ArrowUpRight } from "lucide-react";

const GITHUB_URL = "https://github.com/Prohar04/EducAI";
const SUPPORT_EMAIL = "support.educai@gmail.com";

type FooterLink = { label: string; href: string; external?: boolean };

const PRODUCT_LINKS: FooterLink[] = [
  { label: "Job Finder", href: "/app/jobs" },
  { label: "Scholarships", href: "/app/scholarships" },
  { label: "University Programs", href: "/app/programs" },
  { label: "SOP Builder", href: "/app/sop" },
  { label: "CV Builder", href: "/app/cv" },
  { label: "Resume Builder", href: "/app/resume" },
  { label: "Application Strategy", href: "/app/strategy" },
  { label: "Immigration Guide", href: "/app/immigration" },
  { label: "Gap Fix", href: "/app/gap-fix" },
];

const RESOURCE_LINKS: FooterLink[] = [
  { label: "Data Freshness", href: "/app/data-sync" },
  { label: "Countries Guide", href: "/countries" },
  { label: "Study Abroad Info", href: "/study-abroad" },
  { label: "Contact & Support", href: `mailto:${SUPPORT_EMAIL}`, external: true },
  { label: "GitHub", href: GITHUB_URL, external: true },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Get Started", href: "/auth/signup" },
  { label: "Sign In", href: "/auth/signin" },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const sharedClass =
    "text-sm text-[#3D4F6B] hover:text-[#4A90D9] transition-colors duration-150 flex items-center gap-1";

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClass}
        aria-label={`${link.label} (opens in new tab)`}
      >
        {link.label}
        <ArrowUpRight size={11} className="opacity-50" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={link.href} className={sharedClass}>
      {link.label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="border-t border-white/[0.04] bg-[#060B14]"
    >
      {/* Main grid */}
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* ── Brand column ────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <Link
              href="/"
              className="mb-4 inline-flex items-baseline gap-0.5"
              aria-label="EducAI — home"
            >
              <span className="text-lg font-light tracking-tight text-[#E8EEF8]">
                Educ
              </span>
              <span className="text-lg font-bold text-[#4A90D9]">AI</span>
            </Link>

            {/* Tagline */}
            <p className="mb-3 text-sm font-medium text-[#B8CCE8]">
              AI-powered study abroad platform.
            </p>

            {/* Description */}
            <p className="mb-4 text-xs leading-relaxed text-[#3D4F6B]">
              Real university programs, scholarships, job listings, visa
              guidance, and document tools — built to reduce guesswork for
              international students.
            </p>

            {/* Trust line */}
            <p className="mb-6 text-xs font-medium text-[#4A90D9]/70">
              Real data. Honest AI. Better applications.
            </p>

            {/* Social / contact row */}
            <div className="flex items-center gap-3">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EducAI on GitHub (opens in new tab)"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[#3D4F6B] transition-colors hover:border-[#4A90D9]/30 hover:text-[#4A90D9]"
              >
                <Github size={15} aria-hidden="true" />
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                aria-label={`Email support at ${SUPPORT_EMAIL}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[#3D4F6B] transition-colors hover:border-[#4A90D9]/30 hover:text-[#4A90D9]"
              >
                <Mail size={15} aria-hidden="true" />
              </a>
              <span className="text-xs text-[#2A3A52]">{SUPPORT_EMAIL}</span>
            </div>
          </div>

          {/* ── Product column ───────────────────────────────────────── */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#4A5568]">
              Product
            </h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* ── Resources column ─────────────────────────────────────── */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#4A5568]">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal / account column ───────────────────────────────── */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#4A5568]">
              Legal & Account
            </h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.03]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row sm:px-8 lg:px-10">
          <p className="text-xs text-[#2A3A52]">
            © {new Date().getFullYear()} EducAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-[#2A3A52] transition-colors hover:text-[#4A90D9]"
            >
              Privacy
            </Link>
            <span className="text-[#2A3A52]/40">·</span>
            <Link
              href="/terms"
              className="text-xs text-[#2A3A52] transition-colors hover:text-[#4A90D9]"
            >
              Terms
            </Link>
            <span className="text-[#2A3A52]/40">·</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-xs text-[#2A3A52] transition-colors hover:text-[#4A90D9]"
              aria-label={`Contact support at ${SUPPORT_EMAIL}`}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
