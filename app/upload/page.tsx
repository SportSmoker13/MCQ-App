import type { Metadata } from "next";
import { UploadCloud } from "lucide-react";
import { UploadZone } from "@/components/upload/UploadZone";

export const metadata: Metadata = {
  title: "Upload Questions — MCQ Manager",
  description: "Upload an exam image to extract multiple-choice questions using AI.",
};

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Upload Exam Image</h1>
            <p className="text-slate-400 text-sm">AI extracts and answers all questions automatically</p>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-sm text-slate-400 space-y-1">
          <p className="font-medium text-slate-300">How it works:</p>
          <p>1. Drop a photo or scan of your exam paper</p>
          <p>2. The OCR Agent extracts all questions and options</p>
          <p>3. The Answering Agent determines the correct answer for each question</p>
          <p>4. Questions are saved to your personal question bank</p>
        </div>
      </div>

      <UploadZone />
    </div>
  );
}
