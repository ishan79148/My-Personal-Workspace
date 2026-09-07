"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Perform a full navigation so the new session cookie is recognized by server layouts
      window.location.href = "/";
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="font-serif text-2xl text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Sign in to keep writing where you left off.
        </p>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-ink-muted">Email</span>
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          required
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-ink-muted">Password</span>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          required
        />
      </label>
      {error && <p className="text-sm text-rust">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary mt-1">
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <a
        href="/register"
        className="text-center text-xs text-ink-muted hover:text-ink"
      >
        Need an account? Register
      </a>
    </form>
  );
}
