import { ollamaChat, type OllamaMessage } from "@/lib/ollama";
import { OCR_SYSTEM_PROMPT } from "@/lib/prompts";
import { type RawQuestion } from "@/types";
import { z } from "zod";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const RawQuestionSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
});

const RawQuestionArraySchema = z.array(RawQuestionSchema);

// ─── OCR Agent ────────────────────────────────────────────────────────────────

const OCR_MODEL = "llama3.2-vision";

/**
 * OCR Agent
 *
 * Sends the image to llama3.2-vision and extracts all MCQ questions with their
 * raw option texts. Does NOT determine correct answers.
 *
 * @param base64DataUri - The image encoded as a base64 data URI
 * @returns Array of RawQuestion objects
 */
export async function runOcrAgent(base64DataUri: string): Promise<RawQuestion[]> {
  const messages: OllamaMessage[] = [
    {
      role: "system",
      content: OCR_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: base64DataUri },
        },
        {
          type: "text",
          text: "Extract all multiple-choice questions from this image. Return the JSON array only.",
        },
      ],
    },
  ];

  // Retry once on parse failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rawResponse = await ollamaChat(OCR_MODEL, messages);
      const cleaned = stripJsonFences(rawResponse);
      const parsed = JSON.parse(cleaned);
      const validated = RawQuestionArraySchema.parse(parsed);
      return validated;
    } catch (err) {
      if (attempt === 2) {
        throw new Error(
          `OCR Agent failed after 2 attempts: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      // Add a correction message for the second attempt
      messages.push({
        role: "assistant",
        content: "I need to retry with a valid JSON array.",
      });
    }
  }

  throw new Error("OCR Agent: unreachable");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Remove markdown code fences if the model wraps output in them despite instructions */
function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}
