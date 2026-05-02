"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { type AgentStep } from "@/types";

interface Step {
  key: AgentStep;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  {
    key: "saving",
    label: "Saving image",
    description: "Writing image to local storage…",
  },
  {
    key: "ocr",
    label: "OCR Agent",
    description: "Extracting questions with Llama 3.2 Vision…",
  },
  {
    key: "answering",
    label: "Answering Agent",
    description: "Generating answers & explanations with Llama 3…",
  },
  {
    key: "persisting",
    label: "Saving to database",
    description: "Writing questions to Supabase…",
  },
];

const STEP_ORDER: AgentStep[] = ["saving", "ocr", "answering", "persisting", "done"];

function getStepIndex(step: AgentStep): number {
  return STEP_ORDER.indexOf(step);
}

interface Props {
  currentStep: AgentStep;
}

export function ProgressStepper({ currentStep }: Props) {
  const currentIndex = getStepIndex(currentStep);
  const isError = currentStep === "error";

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
        Processing Pipeline
      </h3>
      <div className="space-y-3">
        {STEPS.map((step, idx) => {
          const stepIndex = idx; // 0-based index in STEPS array
          const currentStepIndex = currentIndex - 1; // saving=0, ocr=1, etc.

          let status: "pending" | "active" | "done" | "error";
          if (isError && stepIndex === currentStepIndex) {
            status = "error";
          } else if (stepIndex < currentStepIndex) {
            status = "done";
          } else if (stepIndex === currentStepIndex) {
            status = "active";
          } else {
            status = "pending";
          }

          return (
            <div
              key={step.key}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                status === "active"
                  ? "bg-indigo-900/30 border border-indigo-700/40"
                  : status === "done"
                  ? "opacity-60"
                  : "opacity-30"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {status === "done" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                {status === "active" && (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                )}
                {status === "error" && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                {status === "pending" && (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    status === "active"
                      ? "text-indigo-300"
                      : status === "done"
                      ? "text-emerald-400"
                      : status === "error"
                      ? "text-red-400"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
                {status === "active" && (
                  <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
