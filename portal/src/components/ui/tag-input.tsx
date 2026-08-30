"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
  className?: string;
  disabled?: boolean;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Type and press Enter or comma...",
  suggestions = [],
  maxTags = 20,
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (tags.length >= maxTags) return;

    // Check case-insensitive duplicate
    const exists = tags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  };

  const unusedSuggestions = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-[44px] w-full flex-wrap items-center gap-1.5 rounded-sm border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors",
          "focus-within:border-brown-800/40 focus-within:ring-2 focus-within:ring-amber-500/20",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {tags.map((tag, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className="flex items-center gap-1 bg-brown-800/10 text-brown-800 hover:bg-brown-800/15 border border-brown-800/20 px-2.5 py-0.5 text-xs font-semibold rounded-sm transition-all"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(idx);
                }}
                className="ml-0.5 rounded-xs p-0.5 text-brown-800/70 hover:bg-brown-800/20 hover:text-brown-900 transition-colors cursor-pointer"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue) addTag(inputValue);
            }}
            disabled={disabled}
            placeholder={tags.length === 0 ? placeholder : "Add more..."}
            className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />
        )}
      </div>

      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Suggestions:
          </span>
          {unusedSuggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              disabled={disabled || tags.length >= maxTags}
              className="inline-flex items-center gap-1 rounded-sm border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-brown-800 transition-all cursor-pointer"
            >
              <Plus className="h-2.5 w-2.5" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
