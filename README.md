# n8n Clone

A modern workflow automation platform inspired by n8n, built with Next.js 15, React 19, TypeScript, and Prisma. This project explores recreating n8n's workflow automation capabilities with a type-safe, performant architecture.

## Tech Stack

- **Framework**: Next.js 15.5 with App Router and Turbopack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (50+ components, New York style)
- **Database**: PostgreSQL with Prisma ORM
- **API Layer**: tRPC 11.7 for type-safe APIs
- **State Management**: TanStack React Query (v5)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use [Neon](https://neon.tech) for serverless PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd n8n-clone
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
cp .env.example .env

# Add your PostgreSQL connection string
DATABASE_URL="postgresql://..."
```

4. Set up the database:
```bash
# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (server component)
│   ├── Client.tsx         # Client component example
│   └── api/trpc/          # tRPC API endpoints
├── components/
│   └── ui/                # shadcn/ui components (50+)
├── trpc/                  # tRPC setup
│   ├── routers/           # API route definitions
│   ├── init.ts            # tRPC initialization
│   ├── client.tsx         # Client-side tRPC
│   └── server.tsx         # Server-side tRPC
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── lib/
│   ├── db.ts              # Prisma client
│   ├── utils.ts           # Utility functions
│   └── generated/prisma/  # Generated Prisma client
├── hooks/                 # Custom React hooks
└── docs/                  # Documentation
    └── data-fetching-pattern.md
```

## Key Features

### Type-Safe Data Fetching

This project implements a powerful data fetching pattern combining:
- **tRPC** for end-to-end type safety
- **React Query** for intelligent caching and state management
- **Server Components** for optimal performance

[📖 Read the complete data fetching pattern documentation](./docs/data-fetching-pattern.md)

Key benefits:
- Zero manual type definitions
- Server-side data prefetching (no loading states)
- Automatic cache invalidation
- Request deduplication
- Background data synchronization

### Database Models

Current Prisma schema includes:
- **User** - User accounts with email and name
- **Post** - User-generated posts (1:many with User)
- **Profile** - User profiles (1:1 with User)

### UI Components

50+ pre-installed shadcn/ui components including:
- Forms (Input, Select, Checkbox, Radio, etc.)
- Data Display (Table, Card, Badge, Avatar, etc.)
- Feedback (Alert, Toast, Dialog, Sheet, etc.)
- Navigation (Dropdown, Command, Breadcrumb, etc.)
- Charts (via Recharts integration)

## Available Scripts

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate           # Generate Prisma Client
npx prisma migrate dev        # Create and apply migrations
npx prisma migrate deploy     # Apply migrations (production)
npx prisma studio            # Open database GUI
npx prisma db push           # Push schema without migrations
```

## Documentation

- [Data Fetching Pattern](./docs/data-fetching-pattern.md) - Comprehensive guide to the tRPC + React Query architecture with diagrams
- [CLAUDE.md](./CLAUDE.md) - Project instructions for Claude Code

## Roadmap

### Current Status
- ✅ Next.js 15 with App Router
- ✅ tRPC + React Query setup
- ✅ PostgreSQL + Prisma ORM
- ✅ shadcn/ui component library
- ✅ Type-safe API layer
- ✅ Server-side rendering with data prefetching

### Planned Features
- [ ] Workflow database models (Workflow, Node, Edge)
- [ ] Workflow builder UI (drag-and-drop canvas)
- [ ] Node system (triggers, actions, conditions)
- [ ] Workflow execution engine
- [ ] Integration system
- [ ] Workflow history and logging
- [ ] Authentication and authorization
- [ ] Real-time collaboration
- [ ] Webhook support
- [ ] Scheduling system

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)

## License

MIT
