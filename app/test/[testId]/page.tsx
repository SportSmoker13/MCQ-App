"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/test/QuestionCard";
import { TestHeader } from "@/components/test/TestHeader";
import { submitTest } from "@/actions/test";
import { toast } from "sonner";
import { type TestQuestion, type TestAnswers } from "@/types";

export default function TestPage() {
  const params = useParams<{ testId: string }>();
  const testId = params.testId;
  const router = useRouter();

  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [mode, setMode] = useState<"mock" | "study">("mock");
  const [answers, setAnswers] = useState<TestAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load questions from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(`test-${testId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (Array.isArray(data)) {
          setQuestions(data); // Backward compatibility
          setMode("mock");
        } else {
          setQuestions(data.questions);
          setMode(data.mode);
        }
        setLoaded(true);
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [testId, router]);

  const handleSelect = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    },
    [],
  );

  function handleSubmit() {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question${unanswered !== 1 ? "s" : ""}. Submit anyway?`,
      );
      if (!confirmed) return;
    }

    startTransition(async () => {
      const result = await submitTest(testId, answers, questions);

      if ("error" in result) {
        toast.error("Submission failed", { description: result.error });
        return;
      }

      // Store results for the results page
      sessionStorage.setItem(
        `result-${testId}`,
        JSON.stringify({ ...result, answers, questions }),
      );

      // Clean up test questions
      sessionStorage.removeItem(`test-${testId}`);

      router.push(`/results/${testId}`);
    });
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading test…
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white font-semibold">No questions found for this test.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <TestHeader
        currentIndex={currentIndex}
        total={questions.length}
        answeredCount={answeredCount}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode={mode}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          answers={answers}
          onSelect={handleSelect}
          mode={mode}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            id="prev-question-btn"
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Question jump dots */}
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap max-w-xs justify-center">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                title={`Question ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-indigo-500 scale-125"
                    : answers[q.id]
                    ? "bg-emerald-500"
                    : "bg-slate-600 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>

          <Button
            id="next-question-btn"
            variant="outline"
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={currentIndex === questions.length - 1}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
