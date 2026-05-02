import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { 
  Trophy, 
  Calendar, 
  ChevronRight, 
  BarChart3, 
  Target, 
  Clock,
  TrendingUp,
  History
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function TestHistory() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const tests = await prisma.mockTest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (tests.length === 0) {
    return (
      <Card className="bg-slate-900/60 border-slate-800 border-dashed py-12">
        <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
            <History className="w-8 h-8 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-white">No tests yet</h3>
            <p className="text-slate-400 max-w-xs">
              Complete your first mock test to see your performance history here.
            </p>
          </div>
          <Link 
            href="/"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Start a test now &rarr;
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Calculate analysis stats
  const totalTests = tests.length;
  const completedTests = tests.filter(t => t.completedAt).length;
  const averageScore = tests.reduce((acc, t) => acc + (t.score || 0), 0) / (completedTests || 1);
  const totalQuestions = tests.reduce((acc, t) => acc + t.totalQuestions, 0);
  const bestScore = Math.max(...tests.map(t => t.score || 0));

  return (
    <div className="space-y-8">
      {/* Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Avg. Score</p>
              <p className="text-2xl font-bold text-white">{averageScore.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Best Score</p>
              <p className="text-2xl font-bold text-white">{bestScore}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Qns</p>
              <p className="text-2xl font-bold text-white">{totalQuestions}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Tests</p>
              <p className="text-2xl font-bold text-white">{completedTests}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card className="bg-slate-900/60 border-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-800/50">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-slate-800/50">
          {tests.map((test) => (
            <div 
              key={test.id} 
              className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  (test.score || 0) >= 70 ? "bg-emerald-900/20 text-emerald-400" : 
                  (test.score || 0) >= 40 ? "bg-amber-900/20 text-amber-400" : 
                  "bg-red-900/20 text-red-400"
                }`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{test.score || 0}%</span>
                    <Badge variant="outline" className="bg-slate-800/50 text-[10px] uppercase border-slate-700">
                      {test.totalQuestions} Questions
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(test.createdAt, "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(test.createdAt, "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
              <Link 
                href={`/results/${test.id}`}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
