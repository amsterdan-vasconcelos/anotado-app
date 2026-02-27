"use client";

import { useEffect, useRef } from "react";
import type { SlashCommandItem, SlashMenuState } from "../util/command";

interface SlashCommandMenuProps {
  state: SlashMenuState;
  onSelectIndex: (index: number) => void;
  onExecute: (item: SlashCommandItem) => void;
}

export function SlashCommandMenu({
  state,
  onSelectIndex,
  onExecute,
}: SlashCommandMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: queremos rolar apenas quando o índice muda
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [state.selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state.open || state.items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: state.position.top,
        left: state.position.left,
        zIndex: 50,
      }}
      className="w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
    >
      <div className="p-1 max-h-72 overflow-y-auto">
        {state.items.map((item, index) => {
          const Icon = item.icon;
          const isSelected = index === state.selectedIndex;
          return (
            <button
              key={item.title}
              ref={isSelected ? selectedRef : null}
              type="button"
              onMouseEnter={() => onSelectIndex(index)}
              onClick={() => onExecute(item)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                isSelected
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md border ${
                  isSelected
                    ? "border-blue-200 bg-blue-100 text-blue-600"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight">
                  {item.title}
                </p>
                <p
                  className={`text-xs leading-tight mt-0.5 ${
                    isSelected ? "text-blue-500" : "text-gray-400"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="border-t border-gray-100 px-3 py-1.5 bg-gray-50">
        <p className="text-xs text-gray-400">
          ↑↓ navegar · Enter selecionar · Esc fechar
        </p>
      </div>
    </div>
  );
}
