# NestDocs — Nested Document Editor (Notion-style)
### Full Architecture, Stack, Schema & Workflow Plan

---

## 1. Project Overview

A multi-tenant workspace app where:
- A **User** belongs to one or more **Workspaces**
- Each **Workspace** contains a tree of **Pages** (infinite nesting — pages can have sub-pages, which can have their own sub-pages)
- Each **Page** holds rich text / block content
- Access to a workspace and its pages is controlled by **roles** (Owner / Admin / Editor / Viewer)
- Edits auto-save without full page reloads

This is architecturally very close to Notion, Coda, or Slite — the interesting engineering problems are: **recursive tree data**, **permission-aware routing**, and **low-latency persistence**.

---

## 2. Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14/15 (App Router)** | Server Components + Server Actions fit this app perfectly |
| Language | **TypeScript (strict mode)** | Recursive types, role safety |
| Database | **PostgreSQL** | See §3 — best fit for hierarchical + relational access control |
| ORM | **Prisma** (or Drizzle — see note) | Type-safe queries, migrations |
| Auth | **Auth.js (NextAuth v5)** | Native App Router support, session in JWT or DB |
| Rich text editor | **Tiptap** or **BlockNote** (built on Tiptap/ProseMirror) | Block-based, Notion-like, outputs structured JSON |
| Styling/UI | **Tailwind CSS + shadcn/ui** | Fast to build a clean editor UI |
| Drag & drop | **dnd-kit** | For reordering pages in the sidebar tree |
| State/data fetching | React Server Components + `useOptimistic` / SWR for client bits | Keeps most logic server-side |
| File uploads | **UploadThing** or S3-compatible bucket | For images/attachments in pages |
| Hosting | **Vercel** (app) + **Neon or Supabase** (Postgres) | Serverless-friendly Postgres with pooling |

**Prisma vs Drizzle note:** Next.js Middleware runs on the **Edge runtime**, and standard Prisma (with the `pg` driver) does **not** run there. Two options:
- Keep Middleware checks *coarse* (is there a valid session cookie/JWT?) and do the *real* workspace-role DB check inside the route's Server Component/layout (Node runtime). **This is the recommended, simpler approach** — see §7.
- Or use an edge-compatible driver (Neon's HTTP driver, Drizzle + `@neondatabase/serverless`) if you want to query the DB directly inside Middleware.

---

## 3. Which Database, and Why

**Recommendation: PostgreSQL.**

Reasons this beats a document DB (MongoDB) for this specific app:
- You need **strong relational integrity** between Users ↔ Workspaces ↔ Members ↔ Roles ↔ Pages. Foreign keys + cascading deletes matter a lot here (delete a workspace → delete all its pages, memberships, etc.).
- Postgres supports **recursive CTEs** (`WITH RECURSIVE`), which makes fetching "this page and all its descendants" or "this page and all its ancestors (breadcrumbs)" a single efficient query.
- You still get schema flexibility for the content itself by storing the editor output as a **`JSONB` column** — so you get relational structure *and* flexible content in the same DB.
- Role-based access control reads much more naturally as normalized relational tables than as embedded documents.

Hosting: **Neon** or **Supabase** (serverless Postgres, connection pooling built in, generous free tier, easy to pair with Vercel).

---

## 4. Database Schema (Prisma)

Tree storage strategy: **adjacency list** (`parentId` self-relation) — simplest to reason about and works great with recursive CTEs. Add a denormalized `path`/`depth` column only later if you need to optimize (materialized path), but don't start there.

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  passwordHash  String?
  image         String?
  createdAt     DateTime  @default(now())

  memberships   WorkspaceMember[]
  pagesCreated  Page[]            @relation("PageAuthor")
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  createdAt   DateTime @default(now())

  members     WorkspaceMember[]
  pages       Page[]
}

enum WorkspaceRole {
  OWNER
  ADMIN
  EDITOR
  VIEWER
}

model WorkspaceMember {
  id           String        @id @default(cuid())
  role         WorkspaceRole @default(EDITOR)
  userId       String
  workspaceId  String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace    Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
}

model Page {
  id          String   @id @default(cuid())
  title       String   @default("Untitled")
  icon        String?
  content     Json?    // block/rich-text JSON from the editor
  position    Int      @default(0)      // sibling ordering
  isArchived  Boolean  @default(false)

  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  parentId    String?
  parent      Page?     @relation("PageToPage", fields: [parentId], references: [id], onDelete: Cascade)
  children    Page[]    @relation("PageToPage")

  authorId    String
  author      User      @relation("PageAuthor", fields: [authorId], references: [id])

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  versions    PageVersion[]

  @@index([workspaceId, parentId])
}

model PageVersion {
  id        String   @id @default(cuid())
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  content   Json
  createdAt DateTime @default(now())
}
```

---

## 4.1 Migration Setup — `npm run migrate`

This is what turns `schema.prisma` into actual tables in your database.

### `.env`
```
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require"
```
Neon/Supabase give you this connection string directly from their project dashboard — paste it in as-is. Prisma reads `DATABASE_URL` from `.env` automatically (via the `datasource` block in `schema.prisma`), so nothing else needs to point at it manually.

### `package.json` scripts
```json
{
  "scripts": {
    "migrate": "prisma migrate dev --name init",
    "migrate:deploy": "prisma migrate deploy",
    "db:push": "prisma db push",
    "generate": "prisma generate",
    "studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

- **`npm run migrate`** → runs `prisma migrate dev`. It reads `prisma/schema.prisma`, diffs it against your database's migration history, writes a new SQL file to `prisma/migrations/<timestamp>_<name>/migration.sql`, **applies that SQL to the DB at `DATABASE_URL`**, and regenerates the Prisma Client. This is the command that actually creates your tables the first time you run it, and creates the diff (e.g. new column) every time after.
- **`npm run migrate:deploy`** → runs `prisma migrate deploy`. Applies whatever migration files already exist in `prisma/migrations/` with no prompts and no new file generation. Use this in CI/production — **never run `migrate dev` against a production database.**
- **`db:push`** syncs `schema.prisma` straight to the DB with no migration file at all. Fine for quick prototyping, skip it once you want a real migration history.
- **`postinstall: prisma generate`** makes sure the Prisma Client types regenerate automatically after every `npm install` (e.g. on a fresh clone or a deploy).

### First-time setup, step by step
1. `npm install prisma @prisma/client`
2. Confirm `prisma/schema.prisma` (§4 above) exists and `DATABASE_URL` is set in `.env`
3. `npm run migrate` → creates `prisma/migrations/20250101000000_init/migration.sql`, runs it against your DB, generates the client
4. **Commit `prisma/migrations/` to git** — it's your schema's version history, and `migrate deploy` in production depends on those files being present in the repo

### `lib/db.ts` — Prisma Client singleton
Needed so Next.js dev mode (which hot-reloads modules on every save) doesn't spin up a new DB connection pool each time:
```ts
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

---

## 5. High-Level Architecture

```
                     ┌──────────────────────┐
                     │        Client        │
                     │ (Editor, Sidebar UI)  │
                     └──────────┬───────────┘
                                │ Server Actions (mutations)
                                │ RSC fetch (reads)
                     ┌──────────▼───────────┐
                     │   Next.js App Router  │
                     │  ┌─────────────────┐  │
                     │  │   Middleware     │  │  ← coarse auth check (Edge)
                     │  └────────┬────────┘  │
                     │  ┌────────▼────────┐  │
                     │  │  Layouts /Pages  │  │  ← fine-grained role check (Node)
                     │  │  (RSC, Node rt)  │  │
                     │  └────────┬────────┘  │
                     │  ┌────────▼────────┐  │
                     │  │ Server Actions   │  │  ← auto-save, create/move/delete page
                     │  └────────┬────────┘  │
                     └───────────┼───────────┘
                                 │ Prisma
                     ┌───────────▼───────────┐
                     │   PostgreSQL (Neon)    │
                     │ Users / Workspaces /   │
                     │ Members / Pages(tree)  │
                     └────────────────────────┘
```

---

## 6. Folder & File Structure

```
nestdocs/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20250101000000_init/
│           └── migration.sql          # generated + applied by `npm run migrate`
│
├── src/
│   ├── middleware.ts                     # Edge: session presence check + route matcher
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                  # Landing page
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # Workspace switcher shell
│   │   │   └── [workspaceId]/
│   │   │       ├── layout.tsx            # ← fine-grained role check happens here
│   │   │       ├── page.tsx              # Workspace home / recent pages
│   │   │       ├── settings/
│   │   │       │   ├── page.tsx
│   │   │       │   └── members/page.tsx
│   │   │       └── [noteId]/
│   │   │           ├── page.tsx          # Renders a page + its content
│   │   │           └── [...childPath]/
│   │   │               └── page.tsx      # Catches deeper nested sub-pages
│   │   │
│   │   └── api/
│   │       └── uploads/route.ts
│   │
│   ├── actions/                          # "use server" Server Actions
│   │   ├── page-actions.ts               # createPage, updateContent, move, delete, restore
│   │   ├── workspace-actions.ts          # createWorkspace, renameWorkspace
│   │   └── member-actions.ts             # invite, changeRole, remove
│   │
│   ├── components/
│   │   ├── editor/
│   │   │   ├── Editor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── extensions/
│   │   ├── sidebar/
│   │   │   ├── PageTree.tsx              # recursive tree renderer
│   │   │   ├── PageTreeItem.tsx
│   │   │   └── WorkspaceSwitcher.tsx
│   │   └── ui/                           # shadcn/ui primitives
│   │
│   ├── lib/
│   │   ├── db.ts                         # Prisma client singleton
│   │   ├── auth.ts                       # Auth.js config
│   │   ├── permissions.ts                # role hierarchy + assertion helpers
│   │   └── build-tree.ts                 # flat rows → nested tree
│   │
│   ├── types/
│   │   ├── page.ts                       # PageNode recursive type
│   │   ├── workspace.ts
│   │   └── roles.ts
│   │
│   └── hooks/
│       ├── use-auto-save.ts
│       └── use-debounce.ts
│
├── .env
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 7. Key Workflows

### A. Request → Access Check → Render
1. Request hits `/[workspaceId]/[noteId]`.
2. **Middleware** (Edge runtime) checks only: *is there a valid session token?* If not → redirect to `/login`. This has to stay cheap since Edge can't easily hit your Postgres instance.
3. `(dashboard)/[workspaceId]/layout.tsx` (Node runtime, Server Component) does the **real** check:
   ```ts
   const member = await db.workspaceMember.findUnique({
     where: { userId_workspaceId: { userId, workspaceId } },
   });
   if (!member) redirect("/no-access");
   ```
4. The page Server Component fetches the page + its ancestor chain (for breadcrumbs) + its direct children, using a recursive query or a couple of indexed queries.
5. Content streams to the client; the editor hydrates with the JSON content.

### B. Auto-Save (Server Action)
1. User types → client debounces (e.g. 500ms via `use-debounce`).
2. Debounced callback calls a **Server Action**:
   ```ts
   "use server";
   export async function updatePageContent(pageId: string, content: unknown) {
     const session = await auth();
     await assertCanEdit(session.user.id, pageId); // role check
     await db.page.update({ where: { id: pageId }, data: { content } });
     revalidatePath(`/${workspaceId}/${pageId}`);
   }
   ```
3. No full page reload — React re-renders only what changed, and you can show a small "Saved" indicator using `useFormStatus`/`useOptimistic`.
4. Optionally snapshot into `PageVersion` every N minutes or on significant diffs, for history/undo.

### C. Creating / Moving a Nested Page
1. "Add sub-page" button in `PageTreeItem` calls a Server Action `createPage({ workspaceId, parentId })`.
2. New row inserted with `parentId` set, `position` = max sibling position + 1.
3. Drag-and-drop reordering (dnd-kit) calls `movePage({ pageId, newParentId, newPosition })`, which updates `parentId`/`position` and re-normalizes sibling positions in a transaction.

### D. Role Enforcement
Centralize this so it's not scattered across every action:
```ts
// lib/permissions.ts
export const ROLE_RANK: Record<WorkspaceRole, number> = {
  VIEWER: 1, EDITOR: 2, ADMIN: 3, OWNER: 4,
};

export function hasRole(actual: WorkspaceRole, required: WorkspaceRole) {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

export async function assertRole(userId: string, workspaceId: string, required: WorkspaceRole) {
  const member = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member || !hasRole(member.role, required)) {
    throw new Error("FORBIDDEN");
  }
}
```
Every Server Action starts by calling `assertRole(...)` with the minimum role it needs (e.g. Viewers can read, Editors can edit content, Admins can invite members, only Owners can delete the workspace).

---

## 8. Core TypeScript Types

```ts
// types/roles.ts
export type WorkspaceRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
```

```ts
// types/page.ts
export interface FlatPage {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  position: number;
  workspaceId: string;
  isArchived: boolean;
}

export interface PageNode extends FlatPage {
  children: PageNode[];
}

// lib/build-tree.ts
export function buildTree(pages: FlatPage[], parentId: string | null = null): PageNode[] {
  return pages
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.position - b.position)
    .map((p) => ({ ...p, children: buildTree(pages, p.id) }));
}
```

```ts
// middleware.ts (Edge runtime — keep this cheap!)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/:workspaceId/:path*"],
};
```

---

## 9. Features Worth Adding (beyond your original list)

| Feature | Why it matters |
|---|---|
| **Block-based editor with slash commands** (`/heading`, `/image`, `/table`) | This is what makes it feel "Notion-like" rather than a plain textarea |
| **Drag-and-drop page reordering** | Users expect to rearrange the sidebar tree |
| **Soft delete / Trash + restore** | Prevents accidental permanent data loss |
| **Page version history** | Undo mistakes, see edit history (you already have `PageVersion` in the schema above) |
| **Full-text search across a workspace** | Postgres `tsvector`/`GIN` index to start; Meilisearch/Algolia if you outgrow it |
| **Public "Share to web" links** | Read-only public view of a page via a signed token, no login required |
| **Real-time multiplayer editing** | Yjs + a sync server (Hocuspocus) or Liveblocks — bigger lift, good v2 feature |
| **Comments & @mentions** | Common collaboration feature, ties into notifications |
| **Workspace invitations via email** | Magic-link or token-based invite flow tied to `WorkspaceMember` |
| **Command palette (Cmd+K)** | Fast navigation across pages — `cmdk` library |
| **Export to Markdown / PDF** | Useful "escape hatch" for users, also good portfolio feature |
| **Templates gallery** | Duplicate a pre-built page structure into a workspace |
| **Activity log / audit trail** | Who changed what, when — important once multiple roles exist |
| **Rate limiting on Server Actions** | Prevent abuse of auto-save / page-creation endpoints |
| **Optimistic UI updates** | `useOptimistic` so the sidebar/tree feels instant while the Server Action resolves |

You don't need all of these for v1 — I'd suggest: **auth + workspaces + nested pages + role-based access + block editor + auto-save + trash** as your MVP, then layer in search, sharing, history, and real-time collab afterward.

---

## 10. Suggested Build Order

1. Auth (Auth.js) + User/Workspace/Member schema + workspace creation
2. Role-based Middleware + layout-level access checks
3. Page model + `buildTree` + recursive sidebar rendering
4. Nested dynamic routes (`[workspaceId]/[noteId]`)
5. Rich text editor (Tiptap/BlockNote) wired to `content: Json`
6. Auto-save Server Action + debounce hook
7. Create / move / delete page actions + drag-and-drop reordering
8. Trash + restore
9. Search
10. Sharing, history, real-time collab (v2)

---

Tell me which part you want to go deeper on first (e.g. the Prisma schema, the middleware/auth setup, the recursive sidebar component, or the editor integration) and I'll expand it into working code.
