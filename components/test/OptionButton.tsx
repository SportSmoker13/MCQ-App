"use client";

import { type TestOption } from "@/types";

interface Props {
  option: TestOption;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
  showResult?: boolean;
}

export function OptionButton({ option, isSelected, onSelect, showResult }: Props) {
  const isCorrect = option.isCorrect;
  const isWrong = isSelected && !isCorrect;

  return (
    <button
      type="button"
      onClick={() => !showResult && onSelect(option.id)}
      className={`
        w-full text-left px-5 py-4 rounded-xl border transition-all duration-150
        flex items-start gap-3 group
        ${
          showResult
            ? isCorrect
              ? "bg-emerald-600/20 border-emerald-500 text-emerald-100"
              : isWrong
              ? "bg-red-600/20 border-red-500 text-red-100"
              : "bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60"
            : isSelected
              ? "bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/10"
              : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800/70 hover:text-white"
        }
        ${showResult ? "cursor-default" : ""}
      `}
    >
      {/* Option indicator */}
      <span
        className={`
          mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all
          ${
            showResult
              ? isCorrect
                ? "border-emerald-400 bg-emerald-500"
                : isWrong
                ? "border-red-400 bg-red-500"
                : "border-slate-700"
              : isSelected
                ? "border-indigo-400 bg-indigo-500"
                : "border-slate-600 group-hover:border-indigo-500/60"
          }
        `}
      >
        {isSelected && !showResult && (
          <span className="w-2 h-2 rounded-full bg-white block" />
        )}
        {showResult && (isCorrect || isWrong) && (
           <span className="w-2 h-2 rounded-full bg-white block" />
        )}
      </span>
      <span className="leading-relaxed">{option.text}</span>
    </button>
  );
}
