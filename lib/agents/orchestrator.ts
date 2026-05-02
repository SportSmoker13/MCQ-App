import { runOcrAgent } from "@/lib/agents/ocr-agent";
import { runAnsweringAgent } from "@/lib/agents/answering-agent";
import {
  saveTempImage,
  imageToBase64DataUri,
  cleanupTempFile,
} from "@/lib/local-storage";
import { type AnsweredQuestion, type AgentStep } from "@/types";

export type StepCallback = (step: AgentStep) => void;

/**
 * Orchestrator
 *
 * Coordinates the full ingestion pipeline:
 * 1. Save image to /tmp
 * 2. Convert to base64
 * 3. OCR Agent → extract questions
 * 4. Answering Agent → determine answers + explanations
 * 5. Cleanup temp file
 *
 * Reports each step via the optional `onStep` callback so the UI can
 * show live progress.
 */
export async function runPipeline(
  file: File,
  onStep?: StepCallback,
): Promise<{ questions: AnsweredQuestion[]; imagePath: string }> {
  let imagePath = "";

  try {
    // Step 1: Save image locally
    onStep?.("saving");
    imagePath = await saveTempImage(file);

    // Step 2: Convert to base64 data URI
    const base64DataUri = await imageToBase64DataUri(imagePath);

    // Step 3: OCR Agent
    onStep?.("ocr");
    const rawQuestions = await runOcrAgent(base64DataUri);

    if (rawQuestions.length === 0) {
      throw new Error(
        "The OCR agent could not extract any questions from the image. Please ensure the image contains clear, readable MCQ text.",
      );
    }

    // Step 4: Answering Agent
    onStep?.("answering");
    const answeredQuestions = await runAnsweringAgent(rawQuestions);

    return { questions: answeredQuestions, imagePath };
  } finally {
    // Always clean up the temp file, even on error
    if (imagePath) {
      await cleanupTempFile(imagePath);
    }
  }
}
