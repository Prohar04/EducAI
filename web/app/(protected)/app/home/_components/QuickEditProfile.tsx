"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { upsertUserProfile } from "@/lib/auth/action";
import { CheckCircle2, Loader2 } from "lucide-react";

const ENGLISH_TEST_OPTIONS = ["None", "IELTS", "TOEFL", "PTE", "Duolingo", "TestDaF"];

export default function QuickEditProfile({
  majorOrTrack,
  englishTestType,
}: {
  majorOrTrack?: string | null;
  englishTestType?: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(upsertUserProfile, null);
  const successRef = useRef(false);

  useEffect(() => {
    if (state?.success && !successRef.current) {
      successRef.current = true;
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {/* Major / Track */}
      <div className="space-y-1.5">
        <label htmlFor="majorOrTrack" className="text-xs font-medium text-muted-foreground">
          Major / Field of Study
        </label>
        <input
          id="majorOrTrack"
          name="majorOrTrack"
          type="text"
          defaultValue={majorOrTrack ?? ""}
          placeholder="e.g. Computer Science, MBA, Electrical Engineering"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* English Test Type */}
      <div className="space-y-1.5">
        <label htmlFor="englishTestType" className="text-xs font-medium text-muted-foreground">
          English Test
        </label>
        <select
          id="englishTestType"
          name="englishTestType"
          defaultValue={englishTestType ?? ""}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="" disabled>Select test type</option>
          {ENGLISH_TEST_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Feedback */}
      {state?.success && (
        <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="size-3.5" /> Saved!
        </p>
      )}
      {state?.success === false && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
