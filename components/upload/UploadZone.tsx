"use client";

import { useCallback, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProgressStepper } from "./ProgressStepper";
import { ingestImage } from "@/actions/ingest";
import { type AgentStep } from "@/types";

export function UploadZone() {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [step, setStep] = useState<AgentStep>("idle");
  const [isPending, startTransition] = useTransition();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStep("idle");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: isPending,
  });

  function clearFile() {
    setSelectedFile(null);
    setPreview(null);
    setStep("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    startTransition(async () => {
      setStep("saving");

      const formData = new FormData();
      formData.append("image", selectedFile);

      // Step reporting is synchronous in the server action;
      // we animate steps based on expected timing
      setStep("ocr");
      const result = await ingestImage(formData);
      setStep("persisting");

      await new Promise((r) => setTimeout(r, 400)); // Brief visual hold

      if (result.success) {
        setStep("done");
        toast.success(
          `✅ Successfully extracted ${result.count} question${result.count !== 1 ? "s" : ""}!`,
          { description: "Your questions are now available for mock tests." },
        );
        clearFile();
        setStep("idle");
      } else {
        setStep("error");
        toast.error("Processing failed", { description: result.error });
      }
    });
  }

  const isProcessing = isPending || (step !== "idle" && step !== "done" && step !== "error");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
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
          ${isProcessing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input {...getInputProps()} id="image-upload-input" />

        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-xl object-contain shadow-lg"
            />
            {!isProcessing && (
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
            <p className="mt-4 text-sm text-slate-400">
              <span className="text-indigo-400 font-medium">{selectedFile?.name}</span>{" "}
              — {((selectedFile?.size ?? 0) / 1024).toFixed(1)} KB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-slate-800 group-hover:bg-indigo-900/40 rounded-2xl flex items-center justify-center transition-colors border border-slate-700">
              {isDragActive ? (
                <UploadCloud className="w-8 h-8 text-indigo-400 animate-bounce" />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {isDragActive ? "Drop your image here" : "Drag & drop an exam image"}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                or{" "}
                <span className="text-indigo-400 font-medium">browse files</span>
                {" "}— JPEG, PNG, WebP supported
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      {step !== "idle" && <ProgressStepper currentStep={step} />}

      {/* Submit */}
      {selectedFile && !isProcessing && step === "idle" && (
        <form onSubmit={handleSubmit}>
          <Button
            id="process-image-btn"
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-base transition-all duration-200 shadow-lg shadow-indigo-600/20"
          >
            <UploadCloud className="w-5 h-5 mr-2" />
            Extract Questions with AI
          </Button>
        </form>
      )}
    </div>
  );
}
