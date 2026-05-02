"use client";

import { type TestOption } from "@/types";

interface Props {
  option: TestOption;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
}

export function OptionButton({ option, isSelected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={`
        w-full text-left px-5 py-4 rounded-xl border transition-all duration-150
        flex items-start gap-3 group
        ${
          isSelected
            ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/10"
            : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800/70 hover:text-white"
        }
      `}
    >
      {/* Option indicator */}
      <span
        className={`
          mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all
          ${
            isSelected
              ? "border-indigo-400 bg-indigo-500"
              : "border-slate-600 group-hover:border-indigo-500/60"
          }
        `}
      >
        {isSelected && (
          <span className="w-2 h-2 rounded-full bg-white block" />
        )}
      </span>
      <span className="leading-relaxed">{option.text}</span>
    </button>
  );
}
