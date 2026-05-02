import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ManualQuestionForm } from "@/components/question/ManualQuestionForm";

export const metadata: Metadata = {
  title: "Create Question — MCQ Manager",
  description: "Manually add a new multiple-choice question to your bank.",
};

export default function CreateQuestionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Manual Entry</h1>
        <p className="text-slate-400">
          Add questions to your collection manually when an image isn&apos;t available.
        </p>
      </div>

      <ManualQuestionForm />
    </div>
  );
}
