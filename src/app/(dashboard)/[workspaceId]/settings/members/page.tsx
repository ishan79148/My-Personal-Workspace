import { db } from "@/lib/db";
import { inviteMember } from "@/actions/member-actions";

export default async function MembersPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const members = await db.workspaceMember.findMany({
    where: { workspaceId: params.workspaceId },
    include: { user: true },
  });

  async function handleInvite(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    await inviteMember(params.workspaceId, email, "EDITOR");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-lg font-medium">Members</h1>
      <ul className="mb-6 flex flex-col gap-1">
        {members.map((m) => (
          <li key={m.id} className="text-sm">
            {m.user.email} — {m.role}
          </li>
        ))}
      </ul>
      <form action={handleInvite} className="flex gap-2">
        <input
          name="email"
          type="email"
          placeholder="teammate@company.com"
          className="rounded border border-neutral-200 px-3 py-2 text-sm"
          required
        />
        <button className="rounded bg-neutral-900 px-3 py-2 text-sm text-white">
          Invite
        </button>
      </form>
    </div>
  );
}
