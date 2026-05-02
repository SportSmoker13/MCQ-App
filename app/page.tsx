import type { Metadata } from "next";
import Link from "next/link";
import { UploadCloud, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TestConfigForm } from "@/components/dashboard/TestConfigForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard — MCQ Manager",
  description: "View your question bank stats and start a personalized mock test.",
};

async function getUserStats(userId: string) {
  const [documentCount, questionCount, testCount] = await Promise.all([
    prisma.document.count({ where: { userId } }),
    prisma.question.count({ where: { document: { userId } } }),
    prisma.mockTest.count({ where: { userId, completedAt: { not: null } } }),
  ]);
  return { documentCount, questionCount, testCount };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const { documentCount, questionCount, testCount } = await getUserStats(userId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Your AI-powered MCQ question bank is ready.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/create"
            className={buttonVariants({ variant: "outline", className: "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </Link>
          <Link
            href="/upload"
            className={buttonVariants({ variant: "default", className: "bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl" })}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Image
          </Link>
        </div>
      </div>

      {/* Stats */}
      <StatsCards
        documentCount={documentCount}
        questionCount={questionCount}
        testCount={testCount}
      />

      {/* Empty state */}
      {questionCount === 0 && (
        <div className="bg-slate-900/60 border border-dashed border-slate-600 rounded-2xl p-10 text-center">
          <UploadCloud className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No questions yet
          </h2>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">
            Upload a photo of your exam paper and the AI will extract and answer
            all the MCQ questions automatically.
          </p>
          <Link
            href="/upload"
            className={buttonVariants({ variant: "default", className: "bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl" })}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload your first image
          </Link>
        </div>
      )}

      {/* Test config */}
      {questionCount > 0 && (
        <TestConfigForm maxQuestions={questionCount} />
      )}
    </div>
  );
}
