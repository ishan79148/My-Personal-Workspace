const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Clean up existing records (optional, in reverse FK order)
  await prisma.pageVersion.deleteMany();
  await prisma.page.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create demo user
  const passwordHash = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Ishan Demo",
      email: "demo@nestdocs.io",
      passwordHash,
    },
  });

  console.log(`✅ Created demo user: ${demoUser.email} (Password: password123)`);

  // 3. Create sample workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Workspace",
      slug: "acme-workspace",
      members: {
        create: {
          userId: demoUser.id,
          role: "OWNER",
        },
      },
    },
  });

  console.log(`✅ Created workspace: ${workspace.name} (${workspace.slug})`);

  // 4. Create root pages
  const welcomePage = await prisma.page.create({
    data: {
      title: "👋 Welcome to NestDocs",
      workspaceId: workspace.id,
      authorId: demoUser.id,
      position: 0,
      content: {
        text: "# Welcome to NestDocs!\n\nThis is your notion-style nested workspace built with Next.js 15, TypeScript, PostgreSQL, Prisma, and Auth.js.\n\n### Features:\n- 🗂️ Infinitely nested documents\n- ⚡ Real-time auto-saving\n- 🔐 Role-based access control\n- 👥 Workspace collaboration",
      },
    },
  });

  const handbookPage = await prisma.page.create({
    data: {
      title: "📖 Engineering Handbook",
      workspaceId: workspace.id,
      authorId: demoUser.id,
      position: 1,
      content: {
        text: "## Engineering Handbook\n\nGuidelines, best practices, and architecture docs for the team.",
      },
    },
  });

  // 5. Create nested child pages under handbook
  await prisma.page.create({
    data: {
      title: "📐 Architecture Overview",
      workspaceId: workspace.id,
      parentId: handbookPage.id,
      authorId: demoUser.id,
      position: 0,
      content: {
        text: "### System Architecture\n\n- **Frontend**: Next.js 15 App Router & Tailwind CSS\n- **Database**: PostgreSQL with Prisma ORM\n- **Auth**: Auth.js (NextAuth v5 beta)\n- **API**: Next.js Server Actions with role assertions",
      },
    },
  });

  await prisma.page.create({
    data: {
      title: "✅ Coding Guidelines",
      workspaceId: workspace.id,
      parentId: handbookPage.id,
      authorId: demoUser.id,
      position: 1,
      content: {
        text: "### Coding Standards\n\n1. Use TypeScript strict mode.\n2. Validate inputs with Zod.\n3. Verify role permissions on server actions before mutating data.",
      },
    },
  });

  const sprintPage = await prisma.page.create({
    data: {
      title: "🚀 Sprint Planning",
      workspaceId: workspace.id,
      authorId: demoUser.id,
      position: 2,
      content: {
        text: "### Current Sprint Goals\n\n- [x] Setup PostgreSQL schema and migrations\n- [x] Configure Auth and Workspace routing\n- [ ] Expand rich-text editor components\n- [ ] Add drag and drop reordering",
      },
    },
  });

  console.log("🎉 Database seeded successfully with sample workspace and pages!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
