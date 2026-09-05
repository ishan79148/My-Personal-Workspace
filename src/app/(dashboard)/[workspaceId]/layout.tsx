import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMembership } from "@/lib/permissions";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const member = await getMembership(session.user.id, params.workspaceId);
  if (!member) redirect("/no-access");

  return <>{children}</>;
}
