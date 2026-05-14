import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="home-container">
      <div className="home-card">
        <div className="home-badge">✓ Secure & Fast</div>
        <h1 className="home-title">TodoApp</h1>
        <p className="home-subtitle">
          Organize your tasks with a clean, distraction-free experience.
          Powered by Clerk auth and Prisma.
        </p>

        <div className="home-actions">
          <SignedOut>
            <SignUpButton mode="redirect">
              <button className="btn-primary">Get Started Free</button>
            </SignUpButton>
            <SignInButton mode="redirect">
              <button className="btn-secondary">Sign In</button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/todo">
              <button className="btn-primary">Go to My Todos →</button>
            </Link>
          </SignedIn>
        </div>


      </div>
    </main>
  );
}
