"use client";

import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Props {
  currentIndex: number;
  total: number;
  answeredCount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function TestHeader({
  currentIndex,
  total,
  answeredCount,
  onSubmit,
  isSubmitting,
}: Props) {
  const progress = (answeredCount / total) * 100;

  return (
    <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-4">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              Question{" "}
              <span className="text-indigo-400">{currentIndex + 1}</span> of{" "}
              <span className="text-slate-400">{total}</span>
            </p>
            <p className="text-xs text-slate-500">
              {answeredCount} of {total} answered
            </p>
          </div>

          <Button
            id="submit-test-btn"
            onClick={onSubmit}
            disabled={isSubmitting}
            variant="default"
            size="sm"
            className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Flag className="w-4 h-4" />
                Submit Test
              </span>
            )}
          </Button>
        </div>

        <Progress
          value={progress}
          className="h-1.5 bg-slate-800"
        />
      </div>
    </div>
  );
}
