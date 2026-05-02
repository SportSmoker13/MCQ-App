"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const manualQuestionSchema = z.object({
  documentName: z.string().min(1, "Subject/Collection name is required"),
  questionText: z.string().min(5, "Question text is too short"),
  explanation: z.string().optional(),
  options: z.array(z.object({
    text: z.string().min(1, "Option text cannot be empty"),
    isCorrect: z.boolean(),
  })).min(2, "At least 2 options are required")
    .refine(opts => opts.some(o => o.isCorrect), "One option must be marked as correct"),
});

export async function createManualQuestion(data: z.infer<typeof manualQuestionSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    // Find or create a document with this name for this user
    let document = await prisma.document.findFirst({
      where: {
        userId,
        imagePath: `manual:${data.documentName}`,
      },
    });

    if (!document) {
      document = await prisma.document.create({
        data: {
          userId,
          imagePath: `manual:${data.documentName}`,
        },
      });
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        documentId: document.id,
        rawText: data.questionText,
        extractedQuestion: data.questionText,
        correctAnswer: data.options.find(o => o.isCorrect)?.text || "",
        explanation: data.explanation || "",
        options: {
          create: data.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
    });

    revalidatePath("/");
    return { success: true, questionId: question.id };
  } catch (error) {
    console.error("Failed to create manual question:", error);
    return { error: "Failed to save question to database" };
  }
}
