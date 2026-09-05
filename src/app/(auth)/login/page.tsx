"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
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
        className="rounded bg-neutral-900 px-3 py-2 text-sm text-white"
      >
        Sign in
      </button>
      <a href="/register" className="text-center text-xs text-neutral-400">
        Need an account? Register
      </a>
    </form>
  );
}
