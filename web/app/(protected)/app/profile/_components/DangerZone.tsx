"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/account", { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data as { message?: string }).message ?? "Failed to delete account.");
          return;
        }
        router.push("/auth/signin?deleted=1");
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  return (
    <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
        </div>
      </div>

      {!confirming ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-3.5" />
          Delete my account
        </Button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-destructive">
            Are you sure? All your programs, strategies, and documents will be
            permanently deleted.
          </p>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="size-3.5" />
              {isPending ? "Deleting..." : "Yes, delete permanently"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => { setConfirming(false); setError(null); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
