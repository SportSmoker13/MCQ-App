"use client";

import { type TestQuestion, type TestAnswers } from "@/types";
import { OptionButton } from "./OptionButton";

interface Props {
  question: TestQuestion;
  questionNumber: number;
  totalQuestions: number;
  answers: TestAnswers;
  onSelect: (questionId: string, optionId: string) => void;
  mode?: "mock" | "study";
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answers,
  onSelect,
  mode = "mock",
}: Props) {
  const selectedOptionId = answers[question.id];
  const isStudyMode = mode === "study";
  const showResult = isStudyMode && !!selectedOptionId;

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
      {/* Question number badge */}
      <div className="flex items-center gap-3">
        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          Q {questionNumber} of {totalQuestions}
        </span>
        {isStudyMode && (
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Study Mode</span>
        )}
        {selectedOptionId && !isStudyMode && (
          <span className="text-emerald-400 text-xs font-medium">✓ Answered</span>
        )}
      </div>

      {/* Question text */}
      <p className="text-white text-lg font-medium leading-relaxed">
        {question.extractedQuestion}
      </p>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selectedOptionId === option.id}
            onSelect={(optionId) => onSelect(question.id, optionId)}
            showResult={showResult}
          />
        ))}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="mt-8 pt-6 border-t border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wider">Explanation</h4>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-slate-300 leading-relaxed italic">
              {question.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
