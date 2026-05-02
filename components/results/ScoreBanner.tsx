"use client";

import { Trophy, Target, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  score: number;
  total: number;
}

export function ScoreBanner({ score, total }: Props) {
  const percentage = Math.round((score / total) * 100);
  const isPass = percentage >= 60;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-1 h-full ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPass ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Final Score</p>
              <p className="text-3xl font-bold text-white">{score} / {total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Accuracy</p>
              <p className="text-3xl font-bold text-white">{percentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-sm overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-1 h-full ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPass ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Status</p>
              <p className={`text-3xl font-bold ${isPass ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPass ? "Passed" : "Failed"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
