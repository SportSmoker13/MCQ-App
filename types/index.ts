// ─── Shared TypeScript Types ───────────────────────────────────────────────────

// ── Agent Types ──────────────────────────────────────────────────────────────

/** Output from the OCR Agent — raw extracted data, no answers */
export interface RawQuestion {
  questionText: string;
  options: string[];
}

/** Output from the Answering Agent — includes correct answer + explanation */
export interface AnsweredQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

/** Tracks which pipeline step the UI should display */
export type AgentStep =
  | "idle"
  | "saving"
  | "ocr"
  | "answering"
  | "persisting"
  | "done"
  | "error";

// ── Test Types ────────────────────────────────────────────────────────────────

export interface TestOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TestQuestion {
  id: string;
  extractedQuestion: string;
  correctAnswer: string;
  explanation: string;
  options: TestOption[];
}

/** Map of questionId → selected optionId */
export type TestAnswers = Record<string, string>;

export interface TestResult {
  score: number;
  total: number;
  testId: string;
}

// ── Action Response Types ────────────────────────────────────────────────────

export type IngestResult =
  | { success: true; count: number }
  | { success: false; error: string };

export type StartTestResult =
  | { success: true; testId: string; questions: TestQuestion[] }
  | { success: false; error: string };
