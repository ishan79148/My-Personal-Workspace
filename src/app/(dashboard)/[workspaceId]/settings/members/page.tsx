import { db } from "@/lib/db";
import { inviteMember } from "@/actions/member-actions";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const members = await db.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
  });

  async function handleInvite(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    await inviteMember(workspaceId, email, "EDITOR");
  }

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-ink">Members</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Everyone with access to this workspace, and their role.
      </p>

      <ul className="mt-6 flex flex-col divide-y divide-line rounded-md border border-line">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <span className="text-ink">{m.user.email}</span>
            <span className="rounded-full bg-paper-dim px-2 py-0.5 text-xs font-medium text-ink-muted">
              {m.role}
            </span>
          </li>
        ))}
      </ul>

      <form action={handleInvite} className="mt-6 flex gap-2">
        <input
          name="email"
          type="email"
          placeholder="teammate@company.com"
          className="field flex-1"
          required
        />
        <button className="btn-primary">Invite</button>
      </form>
    </div>
  );
}
