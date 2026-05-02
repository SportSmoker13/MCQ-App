import type { Metadata } from "next";
import { TestHistory } from "@/components/history/TestHistory";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Test History — MCQ Manager",
  description: "View your past mock test results and performance analysis.",
};

export default function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Performance History</h1>
        <p className="text-slate-400 text-lg">
          Analyze your progress and review your past mock test attempts.
        </p>
      </div>

      <Suspense fallback={<HistoryLoading />}>
        <TestHistory />
      </Suspense>
    </div>
  );
}

function HistoryLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 bg-slate-800/50 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 bg-slate-800/50 rounded-xl" />
    </div>
  );
}
