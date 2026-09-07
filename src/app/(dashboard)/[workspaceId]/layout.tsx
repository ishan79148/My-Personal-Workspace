import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMembership } from "@/lib/permissions";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await params;
  const member = await getMembership(session.user.id, workspaceId);
  if (!member) redirect("/no-access");

  return <>{children}</>;
}
