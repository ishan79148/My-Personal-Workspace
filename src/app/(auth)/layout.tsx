import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Mark } from "@/components/brand/Mark";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-paper-dim px-6">
      <Link href="/" className="flex items-center gap-2 text-ink">
        <Mark className="h-6 w-6 text-moss" />
        <span className="text-sm font-semibold tracking-tight">
          NestDocs
        </span>
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-line bg-paper p-8 shadow-panel">
        {children}
      </div>
    </div>
  );
}
