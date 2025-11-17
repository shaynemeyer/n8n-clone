# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n clone built with Next.js 15.5, React 19, TypeScript, and Prisma. The project aims to recreate the n8n workflow automation platform.

## Development Commands

### Running the Application
```bash
npm run dev    # Start development server with Turbopack at http://localhost:3000
npm run build  # Build for production with Turbopack
npm start      # Start production server
```

### Code Quality
```bash
npm run lint   # Run ESLint
```

### Database
```bash
npx prisma generate           # Generate Prisma Client
npx prisma migrate dev        # Create and apply migrations
npx prisma migrate deploy     # Apply migrations in production
npx prisma studio            # Open Prisma Studio GUI
npx prisma db push           # Push schema changes without migrations
```

### Background Jobs
```bash
npx inngest-cli dev          # Start Inngest Dev Server (runs on http://localhost:8288)
```

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 15.5 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, shadcn/ui components (New York style)
- **Workflow Editor**: React Flow (@xyflow/react) for node-based visual editor
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with email/password and session management
- **API Layer**: tRPC 11.7 for type-safe APIs
- **State Management**: TanStack React Query (v5) with nuqs for URL state management
- **Background Jobs**: Inngest for reliable workflow orchestration
- **AI Integration**: Vercel AI SDK with Google Gemini, OpenAI, and Anthropic
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React

### Directory Structure
```
app/                      # Next.js App Router pages and layouts
├── layout.tsx           # Root layout with fonts (Geist Sans, Geist Mono)
├── (auth)/              # Auth pages (login, signup)
│   └── layout.tsx       # Auth layout wrapper
├── (dashboard)/         # Protected dashboard routes
│   ├── layout.tsx       # Dashboard layout with sidebar navigation
│   ├── (home)/          # Main dashboard pages with header
│   │   ├── layout.tsx   # Nested layout with AppHeader
│   │   ├── workflows/   # Workflows management page
│   │   ├── credentials/ # Credentials management (with dynamic [credentialId] route)
│   │   └── executions/  # Executions history (with dynamic [executionId] route)
│   └── (editor)/        # Workflow editor pages
│       └── workflows/[workflowId]/ # Dynamic workflow editor route
├── api/
│   ├── auth/            # Better Auth API routes (catch-all handler)
│   ├── inngest/         # Inngest webhook endpoint
│   └── trpc/            # tRPC API endpoints
└── globals.css          # Global styles and Tailwind config

features/                # Feature-based directory structure
├── auth/                # Authentication feature
│   └── components/      # Auth components (auth-layout, login-form, signup-form)
├── editor/              # Workflow editor feature
│   └── components/      # Editor components (editor-header, editor, add-node-button)
│       ├── editor-header.tsx     # EditorHeader, EditorBreadcrumbs, EditorNameInput, EditorSaveButton
│       ├── editor.tsx            # Editor (React Flow integration), EditorLoading, EditorError
│       └── add-node-button.tsx   # AddNodeButton component
├── executions/          # Execution nodes feature
│   └── components/      # Execution node components
│       ├── base-execution-node.tsx  # Base component for execution nodes
│       └── http-request/
│           └── node.tsx             # HTTP Request node implementation
├── triggers/            # Trigger nodes feature
│   └── components/      # Trigger node components
│       ├── base-trigger-node.tsx    # Base component for trigger nodes
│       └── manual-trigger/
│           └── node.tsx             # Manual Trigger node implementation
└── workflows/           # Workflows management feature
    ├── components/      # Workflow components (workflows.tsx)
    ├── hooks/           # Custom hooks (use-workflows.ts, use-workflows-params.ts)
    ├── server/          # Server-side utilities (routers.ts, prefetch.ts, params-loader.ts)
    └── params.ts        # URL params configuration

components/
├── app-header.tsx       # Dashboard header with SidebarTrigger
├── app-sidebar.tsx      # Main application sidebar with navigation
├── entity-components.tsx # Generic reusable components (EntityHeader, EntityContainer, EntitySearch, EntityPagination, etc.)
├── upgrade-modal.tsx    # Upgrade to Pro modal component
├── initial-node.tsx     # Initial placeholder node for workflows
├── node-selector.tsx    # Node type selection sheet component
├── workflow-node.tsx    # Wrapper component with toolbar and metadata
├── react-flow/          # React Flow base components
│   ├── base-node.tsx    # Base node component with consistent styling
│   ├── base-handle.tsx  # Base handle component for node connections
│   └── placeholder-node.tsx # Placeholder node for adding new nodes
└── ui/                  # shadcn/ui components (50+ components)

config/
└── node-components.ts   # React Flow node type registry

lib/
├── auth.ts         # Better Auth server configuration
├── auth-client.ts  # Better Auth client (React)
├── auth-utils.ts   # Auth helpers (requireAuth, requireUnauth)
├── db.ts           # Prisma client instance
├── utils.ts        # Utility functions (cn for className merging)
└── generated/      # Generated Prisma Client (custom output location)
    └── prisma/

trpc/
├── routers/        # tRPC route definitions
├── init.ts         # tRPC config with protectedProcedure middleware
├── client.tsx      # Client-side tRPC setup
└── server.tsx      # Server-side tRPC setup

inngest/
├── client.ts       # Inngest client instance
└── functions.ts    # Background job function definitions

hooks/
├── use-mobile.ts         # Mobile breakpoint detection hook
├── use-entity-search.tsx # Generic search hook with debouncing
└── use-upgrade-modal.tsx # Upgrade modal hook with error detection

prisma/
├── schema.prisma   # Database schema (User, Session, Account, Verification, Workflow)
└── migrations/     # Database migrations

config/
└── constants.ts    # Application constants (pagination defaults)

docs/
├── authentication-system.md        # Complete auth documentation
├── data-fetching-pattern.md        # tRPC + React Query guide
├── styling-and-theming-system.md   # Styling documentation
├── background-jobs-inngest.md      # Inngest background jobs guide
├── dashboard-layout-navigation.md  # Dashboard layout and navigation system
├── workflows-feature.md            # Workflows feature architecture and implementation
├── workflow-editor.md              # Workflow editor implementation
├── generic-components.md           # Reusable entity component patterns
└── search-and-pagination.md        # Search and pagination patterns
```

### Path Aliases
- `@/*` maps to root directory
- Configured in both `tsconfig.json` and `components.json`

### Prisma Configuration
- Custom client output: `lib/generated/prisma`
- Models: User, Session, Account, Verification (Better Auth schema), Workflow
- Connection: PostgreSQL via `DATABASE_URL` environment variable
- Migrations stored in `prisma/migrations/`

### Authentication Setup
- **Library**: Better Auth - modern authentication for TypeScript
- **Server Config**: `lib/auth.ts` - Prisma adapter + email/password enabled
- **Client**: `lib/auth-client.ts` - React hooks and auth methods
- **Session Strategy**: Database-backed sessions with HTTP-only cookies
- **Protected Routes**: Use `requireAuth()` in server components
- **Protected APIs**: Use `protectedProcedure` in tRPC routers
- **Middleware**: `requireUnauth()` prevents logged-in users from accessing login/signup pages

### UI Components
Uses shadcn/ui with:
- Style: new-york
- Base color: neutral
- CSS variables enabled
- RSC (React Server Components) enabled
- 50+ pre-installed components in `components/ui/`

### Next.js Configuration
- **Dev Indicators**: Disabled (`devIndicators: false`)
- **Redirects**: Root path `/` redirects to `/workflows` (temporary redirect)
- **Turbopack**: Enabled by default in development

### ESLint Configuration
- Uses flat config format (`eslint.config.mjs`)
- Extends `next/core-web-vitals` and `next/typescript`
- Ignores: node_modules, .next, out, build, next-env.d.ts

## Important Notes

### Database Models
The Prisma schema defines:

**Authentication Models (managed by Better Auth):**
- **User**: Core user identity (id, email, name, emailVerified, image, timestamps)
- **Session**: Active user sessions (id, token, expiresAt, userId, ipAddress, userAgent)
- **Account**: Authentication provider accounts (password hash for email/password, OAuth tokens)
- **Verification**: Email verification and password reset tokens

**Application Models:**
- **Workflow**: User workflows (id, name, userId, createdAt, updatedAt)
  - Uses CUID for id generation
  - Name auto-generated using `random-word-slugs` package (3 words)
  - Belongs to User with cascading delete
  - Has many Nodes and Connections
  - On creation, automatically creates an INITIAL node at position (0, 0)

- **Node**: Workflow nodes representing individual steps (id, workflowId, name, type, position, data, createdAt, updatedAt)
  - Uses CUID for id generation
  - `type`: NodeType enum (INITIAL, MANUAL_TRIGGER, HTTP_REQUEST)
  - `position`: JSON field storing { x, y } coordinates for React Flow
  - `data`: JSON field for node-specific configuration
  - Has many outputConnections and inputConnections
  - Cascading delete when workflow is deleted

- **Connection**: Edges connecting workflow nodes (id, workflowId, fromNodeId, toNodeId, fromOutput, toInput, createdAt, updatedAt)
  - Uses CUID for id generation
  - `fromNodeId` / `toNodeId`: Node IDs for source and target
  - `fromOutput` / `toInput`: Handle names (default: "main")
  - Unique constraint on [fromNodeId, toNodeId, fromOutput, toInput]
  - Cascading delete when workflow or either node is deleted

**Enums:**
- **NodeType**: INITIAL, MANUAL_TRIGGER, HTTP_REQUEST

When modifying the schema, always run `npx prisma migrate dev` to create migrations and `npx prisma generate` to update the client.

### Authentication Patterns

**Protecting Server Components:**
```typescript
import { requireAuth } from '@/lib/auth-utils';

export default async function ProtectedPage() {
  const session = await requireAuth(); // Redirects to /login if not authenticated
  return <div>Welcome {session.user.name}</div>;
}
```

**Protecting tRPC Procedures:**
```typescript
import { createTRPCRouter, protectedProcedure } from '../init';

export const appRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(({ ctx }) => {
    // ctx.auth.user is available and typed
    return prisma.user.findUnique({ where: { id: ctx.auth.user.id } });
  }),
});
```

**Client-side Auth:**
```typescript
import { authClient } from '@/lib/auth-client';

// Sign in
await authClient.signIn.email({ email, password });

// Sign out
await authClient.signOut();

// Get session in component
const { data: session } = authClient.useSession();
```

For complete authentication documentation, see `docs/authentication-system.md`.

### Component Development
All UI components follow shadcn/ui patterns with Radix UI primitives. Components use the `cn()` utility from `lib/utils.ts` for className merging.

### Generic Entity Components
The application includes reusable generic components for entity management pages (`components/entity-components.tsx`):

**EntityHeader Component:**
- Displays page title and optional description
- Optional "New" button with flexible handling via discriminated union types:
  - `onNew` callback for client-side actions
  - `newButtonHref` for navigation via Link
  - Neither for pages without creation functionality
- Props: `title`, `description`, `newButtonLabel`, `disabled`, `isCreating`
- Responsive design with size adjustments for mobile

**EntityContainer Component:**
- Provides consistent layout wrapper for entity management pages
- Sections: `header`, `search`, `pagination`, and main content (`children`)
- Responsive padding and max-width constraints
- Props: `children`, `header`, `search`, `pagination`

**EntitySearch Component:**
- Search input with icon and customizable placeholder
- Works with `useEntitySearch` hook for debouncing (500ms default)
- Props: `value`, `onChange`, `placeholder`
- Accessible with proper ARIA labels

**EntityPagination Component:**
- Pagination controls with Previous/Next buttons
- Displays current page and total pages
- Automatic button disabling at boundaries and during loading
- Props: `page`, `totalPages`, `onPageChange`, `disabled`

**EntityList Component:**
- Generic list component for rendering entity items
- Supports custom empty state views
- Props: `items`, `renderItem`, `getKey`, `emptyView`, `className`

**EntityItem Component:**
- Reusable card component for entity list items
- Includes image, title, subtitle, actions, and delete functionality
- Props: `href`, `title`, `subtitle`, `image`, `actions`, `onRemove`, `isRemoving`, `className`

**State View Components:**
- `LoadingView`: Loading state with spinner and optional message
- `ErrorView`: Error state with alert icon and message
- `EmptyView`: Empty state with icon, message, and optional "Add item" button

**Upgrade Modal Component:**
- Modal dialog for upgrade prompts using AlertDialog
- Triggered by `FORBIDDEN` errors from tRPC
- Integrated via `useUpgradeModal` hook
- Returns `{ handleError, modal }` for use in components

These components enable consistent UI patterns across workflows, credentials, executions, and future entity pages.

### Application Layout System

**Dashboard Layout (`app/(dashboard)/layout.tsx`):**
- Uses shadcn/ui `SidebarProvider` and `SidebarInset` components
- Wraps all dashboard routes with persistent sidebar navigation
- Provides collapsible sidebar with icon-only mode

**Home Layout (`app/(dashboard)/(home)/layout.tsx`):**
- Nested layout for main dashboard pages (workflows, credentials, executions)
- Includes `AppHeader` component with `SidebarTrigger` for collapsing/expanding sidebar
- Main content area with flex layout

**Editor Layout:**
- Separate route group for workflow editor (`(editor)`)
- Does not include header to maximize editor space
- Still includes sidebar for navigation

**AppSidebar Component (`components/app-sidebar.tsx`):**
- Client component with navigation menu
- Includes logo/branding in header
- Main navigation items:
  - Workflows (`/workflows`) - Folder icon
  - Credentials (`/credentials`) - Key icon
  - Executions (`/executions`) - History icon
- Footer actions:
  - Upgrade to Pro (placeholder)
  - Billing Portal (placeholder)
  - Sign out (functional, redirects to `/login`)
- Uses `usePathname()` for active route highlighting
- Collapsible with tooltip labels in icon mode

**AppHeader Component (`components/app-header.tsx`):**
- Simple header with `SidebarTrigger` button
- Fixed height (h-14) with border-bottom
- Background matches theme background color

### Styling
Tailwind v4 is configured with PostCSS. Global styles and theme variables are in `app/globals.css`. The project uses CSS variables for theming support.

### Environment Variables
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key for Better Auth (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL`: Base URL of the application (e.g., `http://localhost:3000`)
- `INNGEST_EVENT_KEY`: Inngest event key (production only)
- `INNGEST_SIGNING_KEY`: Inngest signing key (production only)

Optional AI provider API keys (for Inngest AI integration):
- `GOOGLE_GENERATIVE_AI_API_KEY`: Google Gemini API key
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic Claude API key

Create a `.env` file in the root (already present and gitignored).

### Background Jobs with Inngest
- **Client**: `inngest/client.ts` - Singleton Inngest instance for sending and receiving events
- **Functions**: `inngest/functions.ts` - Background job definitions with step functions and AI integration
- **API Endpoint**: `app/api/inngest/route.ts` - Webhook endpoint for Inngest to trigger functions
- **Dev Server**: Run `npx inngest-cli dev` alongside Next.js for local development (http://localhost:8288)
- **Event Pattern**: Send events with `inngest.send({ name: 'event/name', data: {...} })`
- **AI Integration**: Uses `step.ai.wrap()` to track AI model calls with automatic token usage and cost estimation
- **Current Implementation**:
  - `execute` function demonstrates multi-provider AI calls (Google Gemini, OpenAI, Anthropic)
  - Registered and active in `/api/inngest` route
  - Event name: `execute/ai`

For complete Inngest documentation, see `docs/background-jobs-inngest.md`.

### TypeScript Configuration
- Strict mode enabled
- Path alias `@/*` for root-level imports
- Target: ES2017
- Module resolution: bundler

## Feature Development Patterns

### Workflows Feature
The workflows feature demonstrates the recommended pattern for building features in this application:

**Feature Structure:**
```
features/workflows/
├── components/          # Client components
│   └── workflows.tsx    # WorkflowsList, WorkflowsHeader, WorkflowsContainer, WorkflowsSearch, WorkflowsPagination
├── hooks/               # Custom React hooks
│   ├── use-workflows.ts        # useSuspenseWorkflows, useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflow, useUpdateWorkflowName
│   └── use-workflows-params.ts # URL params hook (page, pageSize, search)
├── params.ts            # Search params configuration (nuqs)
└── server/              # Server-side utilities
    ├── routers.ts       # tRPC router with CRUD operations
    ├── prefetch.ts      # Server-side prefetch helper
    └── params-loader.ts # Server-side params loader

components/
└── entity-components.tsx # Generic EntityHeader, EntityContainer, EntitySearch, EntityPagination, EntityList, EntityItem

app/(dashboard)/(home)/workflows/
└── page.tsx              # Page component using WorkflowsContainer
```

**Key Files:**
- **Router** (`features/workflows/server/routers.ts`): Defines all tRPC procedures
  - `create`: Creates workflow with auto-generated name (3-word slug) and initial node
    - Automatically creates an INITIAL node at position (0, 0)
    - Node type: NodeType.INITIAL
  - `remove`: Deletes workflow (user-scoped, cascades to nodes and connections)
  - `updateName`: Updates workflow name
  - `getOne`: Fetches single workflow with nodes and connections
    - Includes related nodes and connections
    - Transforms database models to React Flow format (nodes/edges)
    - Returns: { id, name, nodes, edges }
  - `getMany`: Fetches all user workflows with search and pagination
    - Inputs: `page` (default: 1), `pageSize` (default: 5, max: 100), `search` (optional string)
    - Returns: `items`, `page`, `pageSize`, `totalCount`, `totalPages`, `hasNextPage`, `hasPreviousPage`
    - Search is case-insensitive on workflow name
- **Custom Hooks**:
  - `use-workflows.ts`: Client-side data fetching and mutations with suspense
    - `useSuspenseWorkflows`: Fetches all workflows with pagination
    - `useCreateWorkflow`: Creates a new workflow
    - `useRemoveWorkflow`: Deletes a workflow
    - `useSuspenseWorkflow`: Fetches a single workflow by ID
    - `useUpdateWorkflowName`: Updates a workflow's name
  - `use-workflows-params.ts`: URL state management for search/pagination params
- **Params Configuration** (`features/workflows/params.ts`): Defines URL search params with nuqs
- **Prefetch Helper** (`features/workflows/server/prefetch.ts`): Server-side data preloading for SSR (prefetchWorkflows, prefetchWorkflow)
- **Params Loader** (`features/workflows/server/params-loader.ts`): Loads and validates search params on server
- **Components** (`features/workflows/components/workflows.tsx`): Multiple exported components for composable UI
  - `WorkflowsList`: Main list component using `EntityList` to render workflow items
  - `WorkflowItem`: Individual workflow card using `EntityItem` with delete functionality
  - `WorkflowsHeader`: Header with title and "New Workflow" button (uses `EntityHeader`, includes upgrade modal)
  - `WorkflowsSearch`: Search input component (uses `EntitySearch` with `useEntitySearch` hook)
  - `WorkflowsPagination`: Pagination controls (uses `EntityPagination`)
  - `WorkflowsContainer`: Layout wrapper for the entire page (uses `EntityContainer`)
  - `WorkflowsLoading`: Loading state component
  - `WorkflowsError`: Error state component
  - `WorkflowsEmpty`: Empty state component with create action
- **Page** (`app/(dashboard)/(home)/workflows/page.tsx`): Next.js page with auth + prefetch + params, wrapped in `WorkflowsContainer`

**Implementation Pattern:**
1. Define Prisma model in `prisma/schema.prisma`
2. Create tRPC router in feature's `server/routers.ts` (include search/pagination in `getMany`)
3. Register router in `trpc/routers/_app.ts`
4. Create search params configuration using nuqs in `params.ts`
5. Create params loader for SSR in `server/params-loader.ts`
6. Create custom hooks in feature's `hooks/`:
   - `use-*.ts`: Data fetching hook with suspense
   - `use-*-params.ts`: URL params management hook
7. Create prefetch helper in feature's `server/prefetch.ts`
8. Create UI components in feature's `components/` (use generic components: `EntityHeader`, `EntityContainer`, `EntitySearch`, `EntityPagination`)
9. Create page that ties it all together with auth + prefetch + params

**Component Composition Pattern:**
The workflows feature demonstrates composable component architecture:

```typescript
// features/workflows/components/workflows.tsx
export function WorkflowsHeader({ disabled }: { disabled?: boolean }) {
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  );
}

export function WorkflowsSearch() {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows"
    />
  );
}

export function WorkflowsPagination() {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
}

export function WorkflowsContainer({ children }: { children: React.ReactNode }) {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
}

export function WorkflowsList() {
  const workflows = useSuspenseWorkflows();

  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  );
}

export function WorkflowItem({ data }: { data: Workflow }) {
  const removeWorkflow = useRemoveWorkflow();

  const handleRemove = () => {
    removeWorkflow.mutate({ id: data.id });
  };

  return (
    <EntityItem
      href={`/workflows/${data.id}`}
      title={data.name}
      subtitle={<>Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })} &bull; Created {formatDistanceToNow(data.createdAt, { addSuffix: true })}</>}
      image={<WorkflowIcon className="size-5 text-muted-foreground" />}
      onRemove={handleRemove}
      isRemoving={removeWorkflow.isPending}
    />
  );
}
```

```typescript
// app/(dashboard)/(home)/workflows/page.tsx
export default async function WorkflowsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAuth();
  const params = await loadWorkflowsParams(props);
  await prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary>
          <Suspense fallback={<WorkflowsSkeleton />}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
}
```

**Security Pattern:**
- Always use `protectedProcedure` for authenticated endpoints
- Always filter database queries by `ctx.auth.user.id`
- Use `requireAuth()` in page components

For complete workflows documentation with diagrams, see `docs/workflows-feature.md`.

### React Flow Integration

The workflow editor uses React Flow (@xyflow/react) for the visual node-based interface:

**Configuration** (`config/node-components.ts`):
```typescript
export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
} as const satisfies NodeTypes;
```

**Node Component Hierarchy:**
- `BaseNode`: Foundation component with consistent styling and selection states
  - Sub-components: `BaseNodeHeader`, `BaseNodeHeaderTitle`, `BaseNodeContent`, `BaseNodeFooter`
- `BaseHandle`: Styled connection handle component for node inputs/outputs
- `PlaceholderNode`: Dashed-border placeholder for adding nodes (extends BaseNode)
- `WorkflowNode`: Wrapper providing toolbars and metadata display (uses React Flow's NodeToolbar)
- `InitialNode`: First node shown in new workflows (combines WorkflowNode + PlaceholderNode)
- `BaseTriggerNode`: Base component for trigger nodes (source handle only, rounded-l-2xl styling)
- `BaseExecutionNode`: Base component for execution nodes (target and source handles)
- `ManualTriggerNode`: Manual trigger implementation (extends BaseTriggerNode)
- `HttpRequestNode`: HTTP request node implementation (extends BaseExecutionNode)

**Node Selector Component** (`components/node-selector.tsx`):
- Sheet-based UI for selecting and adding new nodes to workflows
- Displays categorized node options:
  - Trigger nodes: MANUAL_TRIGGER
  - Execution nodes: HTTP_REQUEST
- Features:
  - Prevents duplicate manual trigger nodes per workflow
  - Automatically removes INITIAL placeholder when first real node is added
  - Positions new nodes near center with random offset
  - Uses `screenToFlowPosition` for accurate placement
- Props: `open`, `onOpenChange`, `children` (trigger element)

**Editor Component** (`features/editor/components/editor.tsx`):
- Uses React Flow with custom node types
- Local state management for nodes and edges
- Change handlers: `onNodesChange`, `onEdgesChange`, `onConnect`
- UI components: Background, Controls, MiniMap, Panel
- `fitView` prop for auto-centering on load

**Data Transformation** (`features/workflows/server/routers.ts`):
- Database models → React Flow format in `getOne` procedure
- `Node` model → React Flow `Node` type: { id, type, position, data }
- `Connection` model → React Flow `Edge` type: { id, source, target, sourceHandle, targetHandle }

**Node Types:**
- `INITIAL`: Placeholder node for starting workflows (automatically replaced when first real node is added)
- `MANUAL_TRIGGER`: Trigger node that executes workflow when user clicks a button (only one allowed per workflow)
- `HTTP_REQUEST`: Execution node for making HTTP requests (supports GET, POST, PUT, PATCH, DELETE methods)

For complete editor documentation, see `docs/workflow-editor.md`.
