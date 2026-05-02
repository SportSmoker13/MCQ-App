"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  type StartTestResult,
  type TestQuestion,
  type TestAnswers,
} from "@/types";

/**
 * Starts a mock test session.
 * Fetches `count` random questions (with options) for the current user.
 * Creates a MockTest record and returns the testId + questions.
 */
export async function startTest(count: number, sectionId?: string, mode: "mock" | "study" = "mock"): Promise<StartTestResult & { mode: "mock" | "study" }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const userId = session.user.id;

  let where: Prisma.QuestionWhereInput = {};

  if (sectionId === "none") {
    where.sectionId = null;
  } else if (sectionId) {
    // If a section is selected, we want all questions from sections with that same NAME,
    // across all users, since we merged them in the UI.
    const targetSection = await prisma.section.findUnique({
      where: { id: sectionId },
      select: { name: true }
    });
    
    if (targetSection) {
      where.section = {
        name: targetSection.name
      };
    }
  }

  const totalAvailable = await prisma.question.count({ where });

  if (totalAvailable === 0) {
    return {
      success: false,
      error: "No questions available. Please upload an exam image first.",
    };
  }

  const safeCount = Math.min(count, totalAvailable);

  // Fetch all question IDs globally (filtered by section if requested), then shuffle in-memory
  const allQuestionIds = await prisma.question.findMany({
    where,
    select: { id: true },
  });

  // Fisher-Yates shuffle
  const shuffled = allQuestionIds.map((q) => q.id).sort(() => Math.random() - 0.5);
  const selectedIds = shuffled.slice(0, safeCount);

  // Fetch full question data for selected IDs
  const rawQuestions = await prisma.question.findMany({
    where: { id: { in: selectedIds } },
    include: { options: true },
  });

  // Shuffle option order within each question too
  const questions: TestQuestion[] = rawQuestions.map((q) => ({
    id: q.id,
    extractedQuestion: q.extractedQuestion,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    options: q.options
      .map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect }))
      .sort(() => Math.random() - 0.5),
  }));

  // Create MockTest record
  const mockTest = await prisma.mockTest.create({
    data: {
      userId,
      totalQuestions: questions.length,
    },
  });

  return { success: true, testId: mockTest.id, questions, mode };
}

/**
 * Submits a completed test.
 * Calculates score, persists it, and returns the result.
 */
export async function submitTest(
  testId: string,
  answers: TestAnswers,
  questions: TestQuestion[],
): Promise<{ score: number; total: number } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  // Calculate score
  let score = 0;
  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;
    const selectedOption = question.options.find((o) => o.id === selectedOptionId);
    if (selectedOption?.isCorrect) score++;
  }

  // Persist result
  await prisma.mockTest.update({
    where: { id: testId },
    data: {
      score,
      completedAt: new Date(),
    },
  });

  return { score, total: questions.length };
}
