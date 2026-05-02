import { ollamaChat, type OllamaMessage } from "@/lib/ollama";
import { ANSWERING_SYSTEM_PROMPT } from "@/lib/prompts";
import { type AnsweredQuestion, type RawQuestion } from "@/types";
import { z } from "zod";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const AnsweredQuestionSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctAnswerIndex: z.number().int().min(0),
  explanation: z.string().min(1),
});

const AnsweredQuestionArraySchema = z.array(AnsweredQuestionSchema);

// ─── Answering Agent ──────────────────────────────────────────────────────────

const ANSWERING_MODEL = "llama3";

/**
 * Answering Agent
 *
 * Receives RawQuestion[] (no correct answers) from the OCR Agent.
 * Uses llama3 (text model) to determine the correct answer and write an
 * explanation for each question.
 *
 * @param questions - Array of RawQuestion objects from the OCR agent
 * @returns Array of AnsweredQuestion objects with correctAnswerIndex + explanation
 */
export async function runAnsweringAgent(
  questions: RawQuestion[],
): Promise<AnsweredQuestion[]> {
  const messages: OllamaMessage[] = [
    {
      role: "system",
      content: ANSWERING_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `Here are the questions to answer:\n\n${JSON.stringify(questions, null, 2)}\n\nReturn the JSON array only.`,
    },
  ];

  // Retry once on parse failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rawResponse = await ollamaChat(ANSWERING_MODEL, messages);
      const cleaned = stripJsonFences(rawResponse);
      const parsed = JSON.parse(cleaned);

      // Validate and clamp correctAnswerIndex within options bounds
      const raw = AnsweredQuestionArraySchema.parse(parsed);
      return raw.map((q) => ({
        ...q,
        correctAnswerIndex: Math.min(
          Math.max(0, q.correctAnswerIndex),
          q.options.length - 1,
        ),
      }));
    } catch (err) {
      console.error(`[Answering] Attempt ${attempt} failed:`, err instanceof Error ? err.message : err);
      if (attempt === 2) {
        throw new Error(
          `Answering Agent failed after 2 attempts: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      messages.push({
        role: "assistant",
        content: "I need to retry with a valid JSON array.",
      });
    }
  }

  throw new Error("Answering Agent: unreachable");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Remove markdown code fences and any leading/trailing text */
function stripJsonFences(text: string): string {
  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.substring(firstBracket, lastBracket + 1);
  }
  
  return text.trim();
}
