"use client";

import { CheckCircle2, XCircle, HelpCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type TestQuestion } from "@/types";

interface Props {
  question: TestQuestion;
  questionNumber: number;
  selectedOptionId: string | undefined;
}

export function ReviewCard({ question, questionNumber, selectedOptionId }: Props) {
  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect;

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
            Question {questionNumber}
          </Badge>
          {isCorrect ? (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Correct
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
              <XCircle className="w-3 h-3 mr-1" /> {selectedOptionId ? "Incorrect" : "Unanswered"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-medium text-white leading-relaxed">
          {question.extractedQuestion}
        </p>

        <div className="space-y-2">
          {question.options.map((option) => {
            const isUserSelected = selectedOptionId === option.id;
            const isCorrectOption = option.isCorrect;
            
            let bgClass = "bg-slate-800/40 border-slate-700/50 text-slate-400";
            let icon = null;

            if (isCorrectOption) {
              bgClass = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
              icon = <CheckCircle2 className="w-4 h-4" />;
            } else if (isUserSelected && !isCorrectOption) {
              bgClass = "bg-red-500/10 border-red-500/40 text-red-400";
              icon = <XCircle className="w-4 h-4" />;
            }

            return (
              <div
                key={option.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${bgClass}`}
              >
                <span className="text-sm font-medium">{option.text}</span>
                {icon}
              </div>
            );
          })}
        </div>

        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Info className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Explanation</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            &ldquo;{question.explanation}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
