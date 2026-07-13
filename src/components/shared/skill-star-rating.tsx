"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface SkillStarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function SkillStarRating({
  value,
  onChange,
  disabled = false,
  size = "md",
}: SkillStarRatingProps) {
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;
        const filled = rating <= value;

        return (
          <button
            key={rating}
            type="button"
            disabled={disabled || !onChange}
            onClick={() => onChange?.(rating)}
            className={cn(
              "rounded-sm transition-colors",
              onChange && !disabled && "hover:scale-110",
              disabled || !onChange ? "cursor-default" : "cursor-pointer"
            )}
            aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                starSize,
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function SkillStarRatingDisplay({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  return <SkillStarRating value={value} size={size} disabled />;
}
