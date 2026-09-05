export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-xl font-semibold">No access</h1>
      <p className="text-neutral-500">
        You don&apos;t have permission to view this workspace.
      </p>
    </main>
  );
}
