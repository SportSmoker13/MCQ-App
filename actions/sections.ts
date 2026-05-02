"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSections() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.section.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });
}

export async function createSection(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const section = await prisma.section.create({
    data: {
      name,
      userId: session.user.id,
    },
  });

  revalidatePath("/upload");
  revalidatePath("/sections");
  return section;
}

export async function deleteSection(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.section.delete({
    where: { 
      id,
      userId: session.user.id 
    },
  });

  revalidatePath("/upload");
  revalidatePath("/sections");
  revalidatePath("/");
  return { success: true };
}
