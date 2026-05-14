"use client";
import React, { useState, useEffect, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const Page = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchTodos();
  }, [isSignedIn, fetchTodos]);

  const addTask = async () => {
    if (task.trim() === "" || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const newTodo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
      setTask("");
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle");
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="todo-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="todo-wrapper">
      {/* Navbar */}
      <nav className="todo-nav">
        <div className="nav-brand">
          <span className="nav-logo">✓</span>
          <span className="nav-title">TodoApp</span>
        </div>
        <div className="nav-right">
          <span className="nav-greeting">
            Hey, {user?.firstName || "there"} 👋
          </span>
          <UserButton />
        </div>
      </nav>

      {/* Main content */}
      <main className="todo-main">
        <div className="todo-card">
          {/* Header */}
          <div className="todo-header">
            <h1 className="todo-title">My Tasks</h1>
            <div className="todo-stats">
              <span className="stat">
                {completedCount}/{todos.length} done
              </span>
            </div>
          </div>

          {/* Input */}
          <div className="todo-input-row">
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              type="text"
              placeholder="What needs to be done?"
              className="todo-input"
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
              }}
              disabled={adding}
            />
            <button
              onClick={addTask}
              className="todo-add-btn"
              disabled={adding || task.trim() === ""}
            >
              {adding ? "..." : "+ Add"}
            </button>
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {(["all", "active", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-tab ${filter === f ? "active" : ""}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="task-list">
            {loading ? (
              <div className="task-empty">
                <div className="spinner" />
                <p>Loading your tasks...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="task-empty">
                <span className="empty-icon">
                  {filter === "done" ? "🎉" : "📋"}
                </span>
                <p>
                  {filter === "done"
                    ? "No completed tasks yet!"
                    : "No tasks here. Add one above!"}
                </p>
              </div>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.id}
                  className={`task-item ${t.completed ? "completed" : ""}`}
                >
                  <button
                    className={`task-checkbox ${t.completed ? "checked" : ""}`}
                    onClick={() => toggleTodo(t.id)}
                    aria-label="Toggle task"
                  >
                    {t.completed && "✓"}
                  </button>
                  <span className="task-title">{t.title}</span>
                  <button
                    className="task-delete-btn"
                    onClick={() => deleteTodo(t.id)}
                    aria-label="Delete task"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {todos.length > 0 && (
            <div className="todo-footer">
              <span className="footer-count">
                {todos.filter((t) => !t.completed).length} task
                {todos.filter((t) => !t.completed).length !== 1 ? "s" : ""}{" "}
                remaining
              </span>
              {completedCount > 0 && (
                <button
                  className="clear-completed"
                  onClick={async () => {
                    const completed = todos.filter((t) => t.completed);
                    await Promise.all(completed.map((t) => deleteTodo(t.id)));
                  }}
                >
                  Clear completed
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;
