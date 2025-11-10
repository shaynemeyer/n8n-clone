# n8n Clone

A modern workflow automation platform inspired by n8n, built with Next.js 15, React 19, TypeScript, and Prisma. This project explores recreating n8n's workflow automation capabilities with a type-safe, performant architecture.

## Tech Stack

- **Framework**: Next.js 15.5 with App Router and Turbopack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (50+ components, New York style)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with email/password and OAuth support
- **API Layer**: tRPC 11.7 for type-safe APIs
- **State Management**: TanStack React Query (v5)
- **Background Jobs**: Inngest for reliable workflow orchestration
- **AI Integration**: Vercel AI SDK with Google Gemini, OpenAI, and Anthropic
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

# Add your database connection and auth secrets
DATABASE_URL="postgresql://user:password@localhost:5432/n8n_clone"
BETTER_AUTH_SECRET="your-random-secret-key-here"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Optional: Inngest (only needed for production)
# INNGEST_EVENT_KEY="your-inngest-event-key"
# INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Optional: AI Provider API Keys (for background job AI integration)
# GOOGLE_GENERATIVE_AI_API_KEY="your-google-api-key"
# OPENAI_API_KEY="your-openai-api-key"
# ANTHROPIC_API_KEY="your-anthropic-api-key"
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
# Terminal 1: Start Next.js
npm run dev

# Terminal 2 (Optional): Start Inngest Dev Server for background jobs
npx inngest-cli dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For background jobs, the Inngest Dev Server runs at [http://localhost:8288](http://localhost:8288).

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (server component)
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── features/auth/     # Auth components
│   ├── api/
│   │   ├── auth/          # Better Auth API routes
│   │   ├── inngest/       # Inngest webhook endpoint
│   │   └── trpc/          # tRPC API endpoints
│   └── Client.tsx         # Client component example
├── components/
│   └── ui/                # shadcn/ui components (50+)
├── trpc/                  # tRPC setup
│   ├── routers/           # API route definitions
│   ├── init.ts            # tRPC initialization & protected procedures
│   ├── client.tsx         # Client-side tRPC
│   └── server.tsx         # Server-side tRPC
├── inngest/               # Background jobs
│   ├── client.ts          # Inngest client instance
│   └── functions.ts       # Background job function definitions
├── prisma/
│   ├── schema.prisma      # Database schema (User, Session, Account, Workflow)
│   └── migrations/        # Database migrations
├── lib/
│   ├── auth.ts            # Better Auth configuration
│   ├── auth-client.ts     # Client-side auth
│   ├── auth-utils.ts      # Auth helpers (requireAuth, requireUnauth)
│   ├── db.ts              # Prisma client
│   ├── utils.ts           # Utility functions
│   └── generated/prisma/  # Generated Prisma client
├── hooks/                 # Custom React hooks
└── docs/                  # Documentation
    ├── authentication-system.md
    ├── data-fetching-pattern.md
    ├── styling-and-theming-system.md
    └── background-jobs-inngest.md
```

## Key Features

### Authentication System

Complete authentication solution powered by Better Auth:
- **Email/Password Authentication** with secure bcrypt hashing
- **Database-backed Sessions** with automatic expiration
- **Protected Routes** using server-side middleware
- **Protected API Endpoints** via tRPC middleware
- **OAuth Ready** - Placeholder UI for GitHub and Google (easy to enable)

[📖 Read the complete authentication system documentation](./docs/authentication-system.md)

Key features:
- HTTP-only session cookies (XSS protection)
- Auto sign-in after registration
- Server and client-side auth utilities
- Session management with IP and User Agent tracking
- Ready for email verification and 2FA

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

### Background Jobs with Inngest

Reliable workflow orchestration powered by Inngest with AI SDK integration:
- **Step Functions** with automatic retries and error handling
- **AI Observability** via `step.ai.wrap()` for tracking token usage and costs
- **Multi-Provider AI** support (Google Gemini, OpenAI, Anthropic)
- **Event-Driven Architecture** for decoupled systems
- **Type-Safe** integration with tRPC
- **Durable Execution** that survives server restarts
- **Built-in Observability** with the Inngest Dev Server

[📖 Read the complete Inngest documentation](./docs/background-jobs-inngest.md)

Key features:
- Multi-step workflows with `step.run()`, `step.ai.wrap()`, and more
- AI model orchestration with automatic token tracking and cost estimation
- Automatic retry logic with exponential backoff
- Job status polling via tRPC queries
- Local development with visual debugging UI at http://localhost:8288
- Production-ready with webhook-based execution

### Database Models

Current Prisma schema includes:
- **User** - User accounts with email and profile
- **Session** - Active user sessions with expiration
- **Account** - Authentication provider accounts (email/password, OAuth)
- **Verification** - Email verification and password reset tokens
- **Workflow** - Workflow definitions (created via Inngest background jobs)

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

### Background Jobs
```bash
npx inngest-cli dev          # Start Inngest Dev Server at http://localhost:8288
```

## Documentation

- [Authentication System](./docs/authentication-system.md) - Complete guide to Better Auth implementation with login/logout flows, session management, and security
- [Data Fetching Pattern](./docs/data-fetching-pattern.md) - Comprehensive guide to the tRPC + React Query architecture with diagrams and Inngest integration
- [Background Jobs with Inngest](./docs/background-jobs-inngest.md) - Complete guide to setting up and using Inngest for reliable background job orchestration
- [Styling and Theming System](./docs/styling-and-theming-system.md) - Guide to Tailwind CSS v4 and theming
- [CLAUDE.md](./CLAUDE.md) - Project instructions for Claude Code

## Roadmap

### Current Status
- ✅ Next.js 15 with App Router
- ✅ tRPC + React Query setup
- ✅ PostgreSQL + Prisma ORM
- ✅ shadcn/ui component library
- ✅ Type-safe API layer
- ✅ Server-side rendering with data prefetching
- ✅ Authentication system with Better Auth
- ✅ Protected routes and API endpoints
- ✅ Session management
- ✅ Background jobs with Inngest
- ✅ AI SDK integration with Inngest (`step.ai.wrap()`)
- ✅ Multi-provider AI support (Google, OpenAI, Anthropic)
- ✅ Workflow database model

### Planned Features
- [ ] Extended workflow database models (Node, Edge, Execution)
- [ ] Workflow builder UI (drag-and-drop canvas)
- [ ] Node system (triggers, actions, conditions)
- [ ] Workflow execution engine (via Inngest)
- [ ] Integration system (API connectors)
- [ ] Workflow history and logging
- [ ] OAuth providers (GitHub, Google)
- [ ] Email verification
- [ ] Real-time collaboration
- [ ] Webhook support
- [ ] Scheduling system (cron jobs via Inngest)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest AI Observability](https://www.inngest.com/docs/guides/ai-observability)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)

## License

MIT
