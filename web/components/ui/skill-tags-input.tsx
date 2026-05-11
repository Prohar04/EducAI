"use client";
import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  maxTags?: number;
}

export default function SkillTagsInput({
  value,
  onChange,
  placeholder = "Type a skill and press Enter",
  label,
  maxTags = 20,
}: Props) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= maxTags) return;
    onChange([...value, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div>
      {label && (
        <label style={{ fontSize: 13, color: "#7A8BA8", marginBottom: 6, display: "block", fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex", flexWrap: "wrap", gap: 6,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(74,144,217,0.20)",
          borderRadius: 8, minHeight: 44,
          cursor: "text",
        }}
        onClick={() => document.getElementById("skill-tag-input")?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "rgba(74,144,217,0.12)",
              border: "1px solid rgba(74,144,217,0.25)",
              color: "#4A90D9", fontSize: 12, borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              aria-label={`Remove ${tag}`}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#4A90D9", padding: 0, display: "flex" }}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          id="skill-tag-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? placeholder : ""}
          aria-label={label ?? "Skills input"}
          style={{
            background: "none", border: "none", outline: "none",
            color: "#E8EEF8", fontSize: 13, flex: 1, minWidth: 120,
            padding: "2px 4px",
          }}
        />
      </div>
      <p style={{ fontSize: 11, color: "#3D4F6B", marginTop: 4 }}>
        Press Enter or comma to add. {value.length}/{maxTags} skills.
      </p>
    </div>
  );
}
