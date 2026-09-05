# NestDocs

A Notion-style nested document editor — workspaces, infinitely-nestable pages, role-based access, and auto-save. Built with Next.js (App Router), TypeScript, PostgreSQL + Prisma, and Auth.js.

Full architecture, schema rationale, and workflow write-up: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Stack

- Next.js 15 (App Router, Server Actions)
- TypeScript (strict)
- PostgreSQL + Prisma
- Auth.js v5 (Credentials provider)
- Tailwind CSS

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `DATABASE_URL` — a Postgres connection string (e.g. from [Neon](https://neon.tech) or [Supabase](https://supabase.com))
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`

3. **Create the database schema**
   ```bash
   npm run migrate
   ```
   This runs `prisma migrate dev`, which reads `prisma/schema.prisma`, generates a SQL migration under `prisma/migrations/`, and applies it to the database in `DATABASE_URL`.

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`, register an account, and you'll be walked into creating your first workspace.

## Project structure

```
prisma/schema.prisma       Data model (User, Workspace, WorkspaceMember, Page, PageVersion)
src/middleware.ts          Edge-runtime session check
src/app/                   Routes (marketing, auth, dashboard/[workspaceId]/[noteId])
src/actions/               Server Actions (auth, workspace, page, member mutations)
src/lib/                   Prisma client, Auth.js config, role permissions, tree builder
src/components/            Editor, recursive sidebar page tree, workspace switcher
src/types/                 Shared TypeScript types (roles, page tree, workspace)
src/hooks/                 use-debounce, use-auto-save
```

## What's stubbed / next steps

This scaffold covers the core architecture end to end (auth, workspaces, nested pages, role checks, auto-save) but keeps a few things intentionally simple so it's easy to read and extend:

- **Editor** (`src/components/editor/Editor.tsx`) is a plain `<textarea>` for now. Swap in [Tiptap](https://tiptap.dev) or [BlockNote](https://www.blocknotejs.org/) for real block-based, Notion-style editing — the auto-save wiring around it doesn't need to change.
- **Drag-and-drop reordering** isn't wired into the UI yet; `movePage` in `src/actions/page-actions.ts` already exists and is ready to be called from a [dnd-kit](https://dndkit.com/) handler.
- **Trash / restore UI** — `archivePage` / `restorePage` actions exist; there's no dedicated Trash view yet.
- **Email invitations** — `inviteMember` currently requires the invitee to already have an account; a magic-link/token invite flow is a natural next step.
- See `docs/ARCHITECTURE.md` §9 for the full list of features worth adding (search, sharing links, version history, real-time collaboration, etc.) and a suggested build order.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` / `npm start` | Production build / start |
| `npm run migrate` | `prisma migrate dev` — create/apply a new migration against `DATABASE_URL` |
| `npm run migrate:deploy` | `prisma migrate deploy` — apply existing migrations, for CI/production |
| `npm run studio` | Open Prisma Studio to browse your data |
