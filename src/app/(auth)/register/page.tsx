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
    <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-3">
      <h1 className="text-xl font-semibold">Create an account</h1>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded border border-neutral-200 px-3 py-2 text-sm"
        required
      />
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
        minLength={8}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
