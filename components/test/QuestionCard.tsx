"use client";

import { type TestQuestion, type TestAnswers } from "@/types";
import { OptionButton } from "./OptionButton";

interface Props {
  question: TestQuestion;
  questionNumber: number;
  totalQuestions: number;
  answers: TestAnswers;
  onSelect: (questionId: string, optionId: string) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answers,
  onSelect,
}: Props) {
  const selectedOptionId = answers[question.id];

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8 space-y-6 backdrop-blur-sm">
      {/* Question number badge */}
      <div className="flex items-center gap-3">
        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          Q {questionNumber} of {totalQuestions}
        </span>
        {selectedOptionId && (
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
          />
        ))}
      </div>
    </div>
  );
}
