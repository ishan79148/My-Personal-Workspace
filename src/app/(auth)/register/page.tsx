"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth-actions";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await registerUser({ name, email, password });
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Account created, but sign-in failed — try logging in.");
        return;
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="font-serif text-2xl text-ink">Create your workspace</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Takes less than a minute — no credit card, ever.
        </p>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-ink-muted">Name</span>
        <input
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field"
          required
        />
      </label>
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
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          required
          minLength={8}
        />
      </label>
      {error && <p className="text-sm text-rust">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary mt-1">
        {pending ? "Creating…" : "Create account"}
      </button>
      <a
        href="/login"
        className="text-center text-xs text-ink-muted hover:text-ink"
      >
        Already have an account? Sign in
      </a>
    </form>
  );
}
