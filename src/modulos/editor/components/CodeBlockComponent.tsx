"use client";

import type { NodeViewProps } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { value: "", label: "Texto puro" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash" },
  { value: "xml", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "graphql", label: "GraphQL" },
];

export function CodeBlockComponent({ node, updateAttributes }: NodeViewProps) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const language = (node.attrs.language as string) || "";
  const currentLabel =
    LANGUAGES.find((l) => l.value === language)?.label ?? "Linguagem";

  const handleOpen = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
    setOpen((o) => !o);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div contentEditable={false} className="code-block-header">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-border select-none"
        >
          {currentLabel}
          <ChevronDown
            size={11}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 9999,
          }}
          className="w-40 bg-card border border-border rounded-lg shadow-xl overflow-y-auto max-h-60"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value || "__plain__"}
              type="button"
              onClick={() => {
                updateAttributes({ language: lang.value });
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                lang.value === language
                  ? "bg-secondary text-secondary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      <pre className="mt-0! rounded-tl-none! rounded-tr-none!">
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  );
}
