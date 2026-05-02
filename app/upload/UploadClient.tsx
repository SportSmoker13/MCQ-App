"use client";

import { useState } from "react";
import { UploadCloud, FileText, Image as ImageIcon } from "lucide-react";
import { UploadZone } from "@/components/upload/UploadZone";
import { CSVUploadZone } from "@/components/upload/CSVUploadZone";

export function UploadClient() {
  const [mode, setMode] = useState<"image" | "csv">("image");

  return (
    <>
      {/* Header Content */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Import Questions</h1>
            <p className="text-slate-400 text-sm">Add questions to your bank via AI or CSV</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-800/50 border border-slate-700/50 rounded-xl mb-8">
          <button
            onClick={() => setMode("image")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              mode === "image" 
                ? "bg-indigo-600 text-white shadow-lg" 
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image Extraction (AI)
          </button>
          <button
            onClick={() => setMode("csv")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              mode === "csv" 
                ? "bg-indigo-600 text-white shadow-lg" 
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            CSV Import
          </button>
        </div>

        {mode === "image" && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-sm text-slate-400 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="font-medium text-slate-300">AI Processing:</p>
            <p>• Extract questions from photos using AI Vision</p>
            <p>• Automatically determines correct answers</p>
          </div>
        )}

        {mode === "csv" && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-sm text-slate-400 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="font-medium text-slate-300">CSV Bulk Import:</p>
            <p>• Import hundreds of questions in seconds</p>
            <p>• Manual control over all fields and correct answers</p>
          </div>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {mode === "image" ? <UploadZone /> : <CSVUploadZone />}
      </div>
    </>
  );
}
