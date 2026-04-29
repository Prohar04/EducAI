import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO_COUNTRIES } from "@/lib/data/seoCountries";

export const metadata: Metadata = {
  title: "Study Abroad by Country — Top Destinations for International Students",
  description:
    "Explore study destinations worldwide: Germany, Canada, UK, Australia, USA, Netherlands, and more. Compare tuition, visa pathways, scholarships, and top universities for each country.",
  alternates: { canonical: "https://educai-web.vercel.app/countries" },
  openGraph: {
    title: "Study Abroad by Country — Top Destinations for International Students",
    description:
      "Compare study destinations: Germany, Canada, UK, Australia, USA, Netherlands, and more. Tuition, scholarships, visa, and university rankings in one place.",
    url: "https://educai-web.vercel.app/countries",
  },
};

export default function CountriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                Study Destinations
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Choose your study destination
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
                Compare top countries for international students — tuition fees, visa paths, scholarships,
                post-study work rights, and leading universities, all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SEO_COUNTRIES.map((country) => (
                <Link
                  key={country.slug}
                  href={`/countries/${country.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <h2 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {country.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">{country.visaType.split("(")[0].trim()}</p>
                    </div>
                  </div>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {country.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Explore guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-border bg-muted/20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <GraduationCap className="mx-auto mb-4 size-10 text-primary" />
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Find programs in your target country
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
              EducAI matches you to programs across all these destinations based on your GPA,
              test scores, budget, and career goals.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="h-12 px-8 text-base font-semibold">
                <Link href="/auth/signup">
                  Start matching for free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
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
