"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, RotateCcw, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScoreBanner } from "@/components/results/ScoreBanner";
import { ReviewCard } from "@/components/results/ReviewCard";
import { type TestQuestion, type TestAnswers } from "@/types";

interface ResultData {
  score: number;
  total: number;
  answers: TestAnswers;
  questions: TestQuestion[];
}

export default function ResultsPage() {
  const params = useParams<{ testId: string }>();
  const testId = params.testId;
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result-${testId}`);
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [testId, router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading results…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Test Results</h1>
        <p className="text-slate-400">Great job! Here is how you performed on this mock test.</p>
      </div>

      <ScoreBanner score={result.score} total={result.total} />

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className={buttonVariants({ variant: "default", className: "flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6" })}
        >
          <LayoutDashboard className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <Link
          href="/upload"
          className={buttonVariants({ variant: "outline", className: "flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl py-6" })}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Upload New Exam
        </Link>
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Detailed Review</h2>
          <span className="text-sm text-slate-500">{result.total} Questions</span>
        </div>
        
        <div className="space-y-6">
          {result.questions.map((question, index) => (
            <ReviewCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              selectedOptionId={result.answers[question.id]}
            />
          ))}
        </div>
      </div>

      <div className="pt-10 flex justify-center">
        <Link
          href="/"
          className={buttonVariants({ variant: "ghost", className: "text-slate-400 hover:text-white hover:bg-slate-800/50" })}
        >
          Return Home <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
