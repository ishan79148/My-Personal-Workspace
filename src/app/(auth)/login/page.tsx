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
    <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-3">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border border-neutral-200 px-3 py-2 text-sm"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border border-neutral-200 px-3 py-2 text-sm"
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <a href="/register" className="text-center text-xs text-neutral-400">
        Need an account? Register
      </a>
    </form>
  );
}
