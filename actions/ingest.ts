"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { runPipeline } from "@/lib/agents/orchestrator";
import { type IngestResult } from "@/types";

/**
 * Ingestion Server Action
 *
 * 1. Authenticate the current user
 * 2. Extract image from FormData
 * 3. Run the OCR → Answering agent pipeline
 * 4. Persist Document + Questions + Options in a Prisma transaction
 *
 * NOTE: No maxDuration needed here because AI runs locally via Ollama,
 * not via a cloud serverless function.
 */
export async function ingestImage(formData: FormData): Promise<IngestResult> {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated. Please sign in." };
  }
  const userId = session.user.id;

  // ── Validate file ─────────────────────────────────────────────────────────
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "No image file provided." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
    };
  }

  const MAX_SIZE_MB = 20;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return {
      success: false,
      error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.`,
    };
  }

  // ── Run pipeline ──────────────────────────────────────────────────────────
  let questions;
  let imagePath;
  try {
    const result = await runPipeline(file);
    questions = result.questions;
    imagePath = result.imagePath;
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI pipeline failed.";
    return { success: false, error: message };
  }

  if (questions.length === 0) {
    return {
      success: false,
      error: "No questions were extracted from the image.",
    };
  }

  // ── Persist to database ───────────────────────────────────────────────────
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const document = await tx.document.create({
        data: {
          userId,
          imagePath: imagePath ?? "",
        },
      });

      for (const q of questions) {
        const correctOptionText = q.options[q.correctAnswerIndex] ?? q.options[0];

        await tx.question.create({
          data: {
            documentId: document.id,
            rawText: q.questionText,
            extractedQuestion: q.questionText,
            correctAnswer: correctOptionText,
            explanation: q.explanation,
            options: {
              create: q.options.map((optText, index) => ({
                text: optText,
                isCorrect: index === q.correctAnswerIndex,
              })),
            },
          },
        });
      }
    });

    return { success: true, count: questions.length };
  } catch (err) {
    console.error("Database transaction failed:", err);
    return {
      success: false,
      error: "Failed to save questions to the database. Please try again.",
    };
  }
}
