"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Quote } from "lucide-react";
import quotes from "@/lib/data/quotes.json";

function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return quotes[dayOfYear % quotes.length];
}

export default function QuoteStrip() {
  const [quote] = useState<string>(() => getDailyQuote());

  return (
    <section className="relative overflow-hidden border-y border-border bg-primary/5 py-14">
      {/* decorative blur */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Quote className="mx-auto mb-4 size-8 text-primary/40" aria-hidden="true" />

        <AnimatePresence mode="wait">
          {quote && (
            <motion.blockquote
              key={quote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-xl font-semibold text-foreground md:text-2xl leading-snug"
            >
              &ldquo;{quote}&rdquo;
            </motion.blockquote>
          )}
        </AnimatePresence>

        <p className="mt-4 text-sm text-muted-foreground">Quote of the day · refreshes daily</p>
      </div>
    </section>
  );
}
