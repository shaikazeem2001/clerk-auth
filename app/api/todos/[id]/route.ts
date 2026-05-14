import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/todos/[id] - toggle completed
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const todo = await prisma.todo.findUnique({ where: { id } });

  if (!todo || todo.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  });

  return NextResponse.json(updated);
}

// DELETE /api/todos/[id] - delete a todo
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const todo = await prisma.todo.findUnique({ where: { id } });

  if (!todo || todo.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
