import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Building2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCountryBySlug, SEO_COUNTRIES } from "@/lib/data/seoCountries";

const BASE_URL = "https://educai-web.vercel.app";

export async function generateStaticParams() {
  return SEO_COUNTRIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) return { title: "Country Not Found · EducAI" };

  return {
    title: `${country.headline}`,
    description: country.description,
    alternates: { canonical: `${BASE_URL}/countries/${slug}` },
    openGraph: {
      title: `${country.headline} · EducAI`,
      description: country.description,
      url: `${BASE_URL}/countries/${slug}`,
    },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  if (!country) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: country.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Countries", item: `${BASE_URL}/countries` },
      {
        "@type": "ListItem",
        position: 3,
        name: country.name,
        item: `${BASE_URL}/countries/${country.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PublicHeader />

      <main>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-border/50 bg-muted/20 py-3"
        >
          <ol className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="size-3.5" />
            <li>
              <Link href="/countries" className="hover:text-foreground transition-colors">
                Countries
              </Link>
            </li>
            <ChevronRight className="size-3.5" />
            <li className="text-foreground font-medium">{country.name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-5xl" aria-hidden="true">
                  {country.flag}
                </span>
                <span className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                  {country.visaType.split("(")[0].trim()}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {country.headline}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {country.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-12 px-8 font-semibold">
                  <Link href="/auth/signup">
                    Find programs in {country.name} <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8">
                  <Link href="/countries">View all countries</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Facts */}
        <section className="border-y border-border/50 bg-muted/20 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Average Tuition
                </p>
                <p className="text-base font-bold text-foreground">{country.avgTuition}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Visa Type
                </p>
                <p className="text-base font-bold text-foreground">{country.visaType.split("(")[0].trim()}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Top Universities
                </p>
                <p className="text-base font-bold text-foreground">
                  {country.topUniversities.length}+ ranked institutions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-16 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-2xl font-extrabold tracking-tight">
                  Why study in {country.name}?
                </h2>
                <ul className="space-y-3">
                  {country.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm leading-relaxed text-muted-foreground">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-2xl font-extrabold tracking-tight flex items-center gap-2">
                    <Building2 className="size-5 text-primary" />
                    Top universities
                  </h2>
                  <ul className="space-y-2">
                    {country.topUniversities.map((u) => (
                      <li
                        key={u}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium"
                      >
                        <GraduationCap className="size-4 text-primary/70 shrink-0" />
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-extrabold tracking-tight flex items-center gap-2">
                    <BookOpen className="size-5 text-primary" />
                    Popular degrees
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {country.popularDegrees.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {country.faqs.length > 0 && (
          <section className="border-t border-border/50 bg-muted/20 py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-2xl font-extrabold tracking-tight">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                {country.faqs.map((faq) => (
                  <div key={faq.q} className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-3 font-bold text-foreground">{faq.q}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-primary/10 bg-primary/5 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <GraduationCap className="mx-auto mb-4 size-10 text-primary" />
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Ready to study in {country.name}?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              EducAI matches you to programs in {country.name} based on your GPA, test scores,
              budget, and career goals — and tracks scholarships and visa deadlines automatically.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-12 px-8 font-semibold">
                <Link href="/auth/signup">
                  Start for free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8">
                <Link href="/scholarships">View scholarships</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Related countries */}
        <section className="border-t border-border py-14 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-xl font-extrabold tracking-tight">
              Explore other destinations
            </h2>
            <div className="flex flex-wrap gap-3">
              {SEO_COUNTRIES.filter((c) => c.slug !== country.slug)
                .slice(0, 6)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/countries/${c.slug}`}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    <span>{c.flag}</span>
                    {c.name}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2" aria-label="EducAI home">
          <GraduationCap className="size-6 text-primary" />
          <span className="text-base font-bold tracking-tight">
            Educ<span className="text-primary">AI</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/countries" className="text-sm font-medium text-primary">
            Countries
          </Link>
          <Link href="/scholarships" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Scholarships
          </Link>
          <Link href="/visa" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Visa Guide
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2" aria-label="EducAI home">
            <GraduationCap className="size-5 text-primary" />
            <span className="text-sm font-bold">
              Educ<span className="text-primary">AI</span>
            </span>
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/countries" className="hover:text-foreground transition-colors">Countries</Link>
            <Link href="/scholarships" className="hover:text-foreground transition-colors">Scholarships</Link>
            <Link href="/visa" className="hover:text-foreground transition-colors">Visa Guide</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} EducAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
