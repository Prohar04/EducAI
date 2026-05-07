"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface SuggestionItem {
  value: string;
  label: string;
  meta?: string;
}

interface SmartAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  localSuggestions?: SuggestionItem[];
  fetchSuggestions?: (query: string) => Promise<SuggestionItem[]>;
  debounceMs?: number;
  maxSuggestions?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  minChars?: number;
  label?: string;
  allowFreeText?: boolean;
}

export function SmartAutocomplete({
  id,
  value,
  onChange,
  placeholder,
  localSuggestions = [],
  fetchSuggestions,
  debounceMs = 250,
  maxSuggestions = 8,
  disabled = false,
  className,
  inputClassName,
  minChars = 1,
  allowFreeText = true,
}: SmartAutocompleteProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [asyncItems, setAsyncItems] = useState<SuggestionItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Merge local + async suggestions, deduped by value, max N items
  const filtered = value.length >= minChars
    ? [
        ...localSuggestions.filter((s) =>
          s.label.toLowerCase().includes(value.toLowerCase()) ||
          s.value.toLowerCase().includes(value.toLowerCase())
        ),
        ...asyncItems.filter(
          (a) => !localSuggestions.some((l) => l.value === a.value)
        ),
      ].slice(0, maxSuggestions)
    : [];

  const fetchAsync = useCallback(
    (q: string) => {
      if (!fetchSuggestions || q.length < minChars) {
        setAsyncItems([]);
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const items = await fetchSuggestions(q);
          setAsyncItems(items);
        } catch {
          setAsyncItems([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [fetchSuggestions, debounceMs, minChars]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    setActiveIndex(-1);
    if (v.length >= minChars) {
      setOpen(true);
      fetchAsync(v);
    } else {
      setOpen(false);
      setAsyncItems([]);
    }
  };

  const select = (item: SuggestionItem) => {
    onChange(item.label);
    setOpen(false);
    setAsyncItems([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showDropdown = open && (filtered.length > 0 || loading);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          id={inputId}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.length >= minChars && (filtered.length > 0 || fetchSuggestions)) {
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? `${inputId}-listbox` : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${inputId}-opt-${activeIndex}` : undefined}
          className={inputClassName}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && (
        <ul
          id={`${inputId}-listbox`}
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-md focus:outline-none"
        >
          {filtered.length === 0 && loading ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Loading…</li>
          ) : (
            filtered.map((item, i) => (
              <li
                key={item.value}
                id={`${inputId}-opt-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(item)}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm flex items-center justify-between gap-2",
                  i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                )}
              >
                <span className="font-medium truncate">{item.label}</span>
                {item.meta && (
                  <span className="text-xs text-muted-foreground shrink-0">{item.meta}</span>
                )}
              </li>
            ))
          )}
          {allowFreeText && value && !filtered.some((f) => f.label.toLowerCase() === value.toLowerCase()) && (
            <li
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setOpen(false); }}
              className="cursor-default px-3 py-2 text-xs text-muted-foreground border-t border-border"
            >
              Press Enter to use &ldquo;{value}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
