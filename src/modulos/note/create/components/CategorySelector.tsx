"use client";

import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  categories: string[];
  value: string;
  onChange: (val: string) => void;
  id?: string;
}

export function CategorySelector({
  categories,
  value,
  onChange,
  id,
}: CategorySelectorProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className={cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50",
        "h-9 w-full rounded-md border bg-transparent px-2.5 py-1 text-sm",
        "shadow-xs transition-[color,box-shadow] outline-none",
        "focus-visible:ring-3",
        "disabled:pointer-events-none disabled:opacity-50",
        "text-foreground",
      )}
    >
      <option value="" disabled>
        Selecione uma categoria
      </option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}
