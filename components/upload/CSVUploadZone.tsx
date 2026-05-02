"use client";

import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, X, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionSelect } from "@/components/shared/SectionSelect";
import { ingestCSV } from "@/actions/csv-ingest";

export function CSVUploadZone() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sectionId, setSectionId] = useState("");
  const [isPending, startTransition] = useTransition();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled: isPending,
  });

  function clearFile() {
    setSelectedFile(null);
  }

  function downloadSample() {
    const csvContent = "question,option1,option2,option3,option4,correctAnswerIndex,explanation,section\n" +
      "\"What is the capital of France?\",\"Paris\",\"London\",\"Berlin\",\"Madrid\",0,\"Paris is the capital and largest city of France.\",\"Geography\"\n" +
      "\"Which planet is known as the Red Planet?\",\"Venus\",\"Mars\",\"Jupiter\",\"Saturn\",1,\"Mars is often called the Red Planet because of iron oxide on its surface.\",\"Science\"";
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcq_sample_format.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.info("Sample CSV format downloaded!");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await ingestCSV(formData, sectionId || undefined);

      if (result.success) {
        toast.success(`✅ Successfully imported ${result.count} questions from CSV!`);
        clearFile();
      } else {
        toast.error("Import failed", { description: result.error });
      }
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Format: <code className="text-indigo-400 bg-slate-800 px-1 rounded">question,opt1,opt2,opt3,opt4,ansIndex,explanation,section</code>
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={downloadSample}
          className="text-xs bg-slate-800/50 border-slate-700 hover:bg-slate-800"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download Sample
        </Button>
      </div>

      {/* Section Input */}
      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <label className="text-sm font-medium text-slate-300">
          Default Section (Optional)
        </label>
        <SectionSelect 
          value={sectionId} 
          onChange={setSectionId} 
          placeholder="Choose a section or create new..."
        />
        <p className="text-[10px] text-slate-500">
          Note: Section names provided inside the CSV file will override this default.
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200 group
          ${isDragActive
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
            : "border-slate-600 hover:border-indigo-500/60 hover:bg-slate-800/30"
          }
          ${isPending ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-900/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 mb-4">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-slate-400 text-sm mt-1">{ (selectedFile.size / 1024).toFixed(1) } KB</p>
            
            {!isPending && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute -top-3 -right-3 w-7 h-7 bg-slate-700 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors border border-slate-600"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-slate-800 group-hover:bg-indigo-900/40 rounded-2xl flex items-center justify-center transition-colors border border-slate-700">
              <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {isDragActive ? "Drop your CSV here" : "Drag & drop your CSV file"}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                or <span className="text-indigo-400 font-medium">browse files</span>
              </p>
            </div>
          </div>
        )}
      </div>



      {/* Submit */}
      {selectedFile && (
        <form onSubmit={handleSubmit}>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-base transition-all duration-200 shadow-lg shadow-indigo-600/20"
          >
            {isPending ? (
              <span className="flex items-center">
                <UploadCloud className="w-5 h-5 mr-2 animate-pulse" />
                Importing...
              </span>
            ) : (
              <span className="flex items-center">
                <UploadCloud className="w-5 h-5 mr-2" />
                Import Questions from CSV
              </span>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
