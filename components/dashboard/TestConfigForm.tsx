"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, Loader2, Shuffle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { startTest } from "@/actions/test";
import { toast } from "sonner";

interface Props {
  maxQuestions: number;
  sections: { id: string; name: string; count: number }[];
}

export function TestConfigForm({ maxQuestions, sections }: Props) {
  const router = useRouter();
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [mode, setMode] = useState<"mock" | "study">("mock");
  const [count, setCount] = useState(Math.min(10, maxQuestions));
  const [takeAll, setTakeAll] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentMax = selectedSectionId === "all" 
    ? maxQuestions 
    : sections.find(s => s.id === selectedSectionId)?.count || 0;

  const effectiveCount = takeAll ? currentMax : Math.min(count, currentMax);

  function handleTakeAllToggle(checked: boolean) {
    setTakeAll(checked);
    if (!checked) setCount(Math.min(10, currentMax));
  }

  function handleSectionChange(sectionId: string) {
    setSelectedSectionId(sectionId);
    const newMax = sectionId === "all" 
      ? maxQuestions 
      : sections.find(s => s.id === sectionId)?.count || 0;
    setCount(Math.min(count, newMax));
  }

  async function handleStart() {
    if (maxQuestions === 0) {
      toast.error("No questions available", {
        description: "Upload exam images first to build your question bank.",
      });
      return;
    }

    startTransition(async () => {
      const result = await startTest(
        effectiveCount, 
        selectedSectionId === "all" ? undefined : selectedSectionId,
        mode
      );
      if (!result.success) {
        toast.error("Could not start test", { description: result.error });
        return;
      }

      // Store questions and mode in sessionStorage
      sessionStorage.setItem(
        `test-${result.testId}`,
        JSON.stringify({ questions: result.questions, mode: result.mode }),
      );
      router.push(`/test/${result.testId}`);
    });
  }

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-indigo-400" />
            Configure Mock Test
          </CardTitle>
          <Badge
            variant="outline"
            className="border-indigo-500/40 text-indigo-300 bg-indigo-500/10"
          >
            {maxQuestions} available
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selector */}
        <div className="space-y-2">
          <Label className="text-slate-300">Choose Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("mock")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                mode === "mock"
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              <Shuffle className="w-5 h-5" />
              <div className="text-center">
                <div className="font-semibold text-sm">Mock Test</div>
                <div className="text-[10px] opacity-70">Timed & Shuffled</div>
              </div>
            </button>
            <button
              onClick={() => setMode("study")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                mode === "study"
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              <PlayCircle className="w-5 h-5" />
              <div className="text-center">
                <div className="font-semibold text-sm">Study Mode</div>
                <div className="text-[10px] opacity-70">Immediate Feedback</div>
              </div>
            </button>
          </div>
        </div>

        {/* Section Selector */}
        <div className="space-y-2">
          <Label className="text-slate-300">Select Section</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleSectionChange("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                selectedSectionId === "all"
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              All Sections
            </button>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedSectionId === section.id
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                {section.name}
                <span className="ml-1.5 opacity-60 text-[10px]">({section.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Take all toggle */}
        <div className="flex items-center justify-between bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <div>
            <Label
              htmlFor="take-all-switch"
              className="text-slate-200 font-medium cursor-pointer"
            >
              Take all questions
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              Include every question in your bank
            </p>
          </div>
          <Switch
            id="take-all-switch"
            checked={takeAll}
            onCheckedChange={handleTakeAllToggle}
            disabled={maxQuestions === 0}
          />
        </div>

        {/* Slider */}
        {!takeAll && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Number of Questions</Label>
              <span className="text-2xl font-bold text-indigo-400">{count}</span>
            </div>
            <Slider
              id="question-count-slider"
              min={1}
              max={currentMax || 1}
              step={1}
              value={[count]}
              onValueChange={(val) => {
                const nextVal = Array.isArray(val) ? val[0] : val;
                if (typeof nextVal === 'number') setCount(nextVal);
              }}
              disabled={currentMax === 0}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1</span>
              <span>{currentMax}</span>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4">
          <p className="text-sm text-slate-300">
            You&apos;ll be tested on{" "}
            <span className="font-bold text-white">{effectiveCount}</span>{" "}
            randomly selected question{effectiveCount !== 1 ? "s" : ""}.
            Questions and options will be shuffled.
          </p>
        </div>

        <Button
          id="start-test-btn"
          onClick={handleStart}
          disabled={isPending || maxQuestions === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-base transition-all shadow-lg shadow-indigo-600/20"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Preparing test…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Start Mock Test
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
