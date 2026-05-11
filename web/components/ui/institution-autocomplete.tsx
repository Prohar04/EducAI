"use client";
import { useState, useEffect, useRef } from "react";

interface University {
  name: string;
  country: string;
  domains: string[];
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function InstitutionAutocomplete({
  value,
  onChange,
  placeholder = "e.g. University of Toronto",
  label,
  className,
}: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<University[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://universities.hipolabs.com/search?name=${encodeURIComponent(query)}&limit=8`,
        );
        const data: University[] = await res.json();
        setSuggestions(data.slice(0, 8));
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }} className={className}>
      {label && (
        <label style={{ fontSize: 13, color: "#7A8BA8", marginBottom: 6, display: "block", fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          aria-label={label ?? placeholder}
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={open}
          aria-controls="institution-autocomplete-listbox"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(74,144,217,0.20)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#E8EEF8",
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {loading && (
          <div style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid rgba(74,144,217,0.3)",
            borderTopColor: "#4A90D9",
            animation: "spin 0.7s linear infinite",
          }} />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div
          id="institution-autocomplete-listbox"
          role="listbox"
          style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            zIndex: 50,
            background: "#0D1625",
            border: "1px solid rgba(74,144,217,0.25)",
            borderRadius: 8, marginTop: 4,
            maxHeight: 280, overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {suggestions.map((uni, i) => (
            <button
              key={i}
              role="option"
              aria-selected={query === uni.name}
              onClick={() => {
                setQuery(uni.name);
                onChange(uni.name);
                setOpen(false);
              }}
              style={{
                display: "block", width: "100%",
                padding: "10px 14px", textAlign: "left",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                color: "#E8EEF8", fontSize: 13,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(74,144,217,0.10)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <div style={{ fontWeight: 500 }}>{uni.name}</div>
              <div style={{ fontSize: 11, color: "#7A8BA8", marginTop: 2 }}>{uni.country}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
