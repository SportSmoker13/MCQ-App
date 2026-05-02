"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { type IngestResult } from "@/types";

/**
 * CSV Ingestion Server Action
 * 
 * Expected Format:
 * question,option1,option2,option3,option4,correctAnswerIndex,explanation
 */
interface CSVQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sectionId?: string;
}

export async function ingestCSV(formData: FormData, sectionId?: string): Promise<IngestResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated. Please sign in." };
  }
  const userId = session.user.id;

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "No CSV file provided." };
  }

  try {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    
    // Skip header if it exists
    const startLine = lines[0].toLowerCase().includes("question") ? 1 : 0;
    const questionsToSave: CSVQuestion[] = [];

    for (let i = startLine; i < lines.length; i++) {
      // Basic CSV splitting (handles quotes simple-ish)
      const parts = parseCSVLine(lines[i]);
      if (parts.length < 6) continue; // Need at least question + 4 options + answer index

      const [questionText, o1, o2, o3, o4, ansIndex, explanation, rowSection] = parts;
      const options = [o1, o2, o3, o4].filter(o => o && o.trim() !== "");
      const correctIdx = parseInt(ansIndex) || 0;

      questionsToSave.push({
        questionText,
        options,
        correctAnswerIndex: Math.min(Math.max(0, correctIdx), options.length - 1),
        explanation: explanation || "Imported via CSV.",
        sectionId: sectionId || undefined,
      });
    }

    if (questionsToSave.length === 0) {
      return { success: false, error: "No valid questions found in CSV." };
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.document.create({
        data: {
          userId,
          imagePath: "csv-import",
          questions: {
            create: questionsToSave.map((q) => ({
              sectionId: q.sectionId,
              rawText: q.questionText,
              extractedQuestion: q.questionText,
              correctAnswer: q.options[q.correctAnswerIndex],
              explanation: q.explanation,
              options: {
                create: q.options.map((optText, index) => ({
                  text: optText,
                  isCorrect: index === q.correctAnswerIndex,
                })),
              },
            })),
          },
        },
      });
    }, { timeout: 30000 });

    return { success: true, count: questionsToSave.length };
  } catch (err) {
    console.error("CSV Import Error:", err);
    return { success: false, error: "Failed to parse or save CSV questions." };
  }
}

/**
 * Simple CSV line parser that handles quoted values
 */
function parseCSVLine(line: string): string[] {
  const result = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  
  // Clean up quotes from result
  return result.map(val => val.replace(/^"|"$/g, ""));
}
