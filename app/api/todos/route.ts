import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/todos - fetch all todos for signed-in user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(todos);
  } catch (err) {
    console.error("[GET /api/todos]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/todos - create a new todo
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await request.json();
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Ensure the User row exists before creating a Todo (foreign key)
    const clerkUser = await currentUser();
    if (clerkUser) {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        },
      });
    }

    const todo = await prisma.todo.create({
      data: { title: title.trim(), userId },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (err) {
    console.error("[POST /api/todos]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
