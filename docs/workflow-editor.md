# Workflow Editor Documentation

## Overview

The Workflow Editor is a dedicated interface for editing and managing individual workflows. It provides features like breadcrumb navigation, inline name editing, and a save button for workflow changes. The editor is located in a separate route group to maximize screen space by excluding the standard dashboard header.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Feature Structure](#feature-structure)
3. [Editor Components](#editor-components)
4. [Data Fetching](#data-fetching)
5. [Implementation Details](#implementation-details)
6. [Best Practices](#best-practices)

---

## Architecture Overview

The workflow editor follows a component-based architecture with clear separation of concerns:

```mermaid
graph TB
    subgraph "Page Layer"
        Page[WorkflowDetailPage]
        Params[Route Params]
    end

    subgraph "Layout"
        EditorHeader[EditorHeader]
        EditorMain[Main Content]
    end

    subgraph "Header Components"
        Breadcrumbs[EditorBreadcrumbs]
        NameInput[EditorNameInput]
        SaveButton[EditorSaveButton]
        SidebarTrigger[SidebarTrigger]
    end

    subgraph "Editor Components"
        Editor[Editor]
        Loading[EditorLoading]
        Error[EditorError]
    end

    subgraph "Data Layer"
        Hook[useSuspenseWorkflow]
        UpdateHook[useUpdateWorkflowName]
        Router[workflowsRouter]
        Prefetch[prefetchWorkflow]
    end

    Page --> Params
    Page --> EditorHeader
    Page --> Editor
    EditorHeader --> SidebarTrigger
    EditorHeader --> Breadcrumbs
    EditorHeader --> SaveButton
    Breadcrumbs --> NameInput
    NameInput --> Hook
    NameInput --> UpdateHook
    Editor --> Hook
    Hook --> Router
    Page --> Prefetch
    Prefetch --> Router

    style Page fill:#e1f5ff
    style EditorHeader fill:#e8f5e9
    style Editor fill:#fff9c4
    style Router fill:#f3e5f5
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **WorkflowDetailPage** | `app/(dashboard)/(editor)/workflows/[workflowId]/page.tsx` | Main page component with SSR |
| **EditorHeader** | `features/editor/components/editor-header.tsx` | Header with breadcrumbs and save button |
| **EditorBreadcrumbs** | `features/editor/components/editor-header.tsx` | Navigation breadcrumbs |
| **EditorNameInput** | `features/editor/components/editor-header.tsx` | Inline workflow name editor |
| **EditorSaveButton** | `features/editor/components/editor-header.tsx` | Save workflow button (placeholder) |
| **Editor** | `features/editor/components/editor.tsx` | Main editor component |
| **EditorLoading** | `features/editor/components/editor.tsx` | Loading state component |
| **EditorError** | `features/editor/components/editor.tsx` | Error state component |
| **useSuspenseWorkflow** | `features/workflows/hooks/use-workflows.ts` | Fetch single workflow hook |
| **useUpdateWorkflowName** | `features/workflows/hooks/use-workflows.ts` | Update workflow name hook |
| **prefetchWorkflow** | `features/workflows/server/prefetch.ts` | Server-side prefetch helper |

---

## Feature Structure

The editor feature is organized under the `features/editor/` directory:

```
features/editor/
├── components/
│   ├── editor-header.tsx      # EditorHeader, EditorBreadcrumbs, EditorNameInput, EditorSaveButton
│   └── editor.tsx             # Editor, EditorLoading, EditorError

features/workflows/
├── hooks/
│   └── use-workflows.ts       # useSuspenseWorkflow, useUpdateWorkflowName
└── server/
    ├── prefetch.ts            # prefetchWorkflow
    └── routers.ts             # getOne, updateName procedures

app/(dashboard)/(editor)/workflows/[workflowId]/
└── page.tsx                   # WorkflowDetailPage

components/
├── entity-components.tsx      # LoadingView, ErrorView
└── ui/
    ├── sidebar.tsx            # SidebarTrigger
    ├── breadcrumb.tsx         # Breadcrumb components
    ├── button.tsx             # Button component
    └── input.tsx              # Input component
```

---

## Editor Components

### EditorHeader

Main header component that combines breadcrumbs, sidebar trigger, and save button.

**File:** `features/editor/components/editor-header.tsx`

```typescript
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { SaveIcon } from 'lucide-react';
import { EditorBreadcrumbs } from './editor-header';

function EditorHeader({ workflowId }: { workflowId: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between gap-x-4 w-full">
        <EditorBreadcrumbs workflowId={workflowId} />
        <EditorSaveButton workflowId={workflowId} />
      </div>
    </header>
  );
}

export default EditorHeader;
```

**Props:**
- `workflowId`: Workflow ID from route params

**Features:**
- Fixed height (h-14) matching dashboard header
- SidebarTrigger for collapsing/expanding sidebar
- Full-width flex layout with breadcrumbs and save button
- Border-bottom for visual separation

### EditorBreadcrumbs

Breadcrumb navigation showing "Workflows > Workflow Name".

**File:** `features/editor/components/editor-header.tsx`

```typescript
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { EditorNameInput } from './editor-header';

export function EditorBreadcrumbs({ workflowId }: { workflowId: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link prefetch href="/workflows">
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
}
```

**Props:**
- `workflowId`: Workflow ID from route params

**Features:**
- Link to workflows list page with prefetch
- Breadcrumb separator
- Inline editable workflow name

### EditorNameInput

Inline workflow name editor with click-to-edit functionality.

**File:** `features/editor/components/editor-header.tsx`

```typescript
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { BreadcrumbItem } from '@/components/ui/breadcrumb';
import {
  useSuspenseWorkflow,
  useUpdateWorkflowName,
} from '@/features/workflows/hooks/use-workflows';

export function EditorNameInput({ workflowId }: { workflowId: string }) {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflowName();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name);
    }
  }, [workflow.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name === workflow.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateWorkflow.mutateAsync({ id: workflowId, name });
    } catch {
      setName(workflow.name);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setName(workflow.name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        disabled={updateWorkflow.isPending}
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-[150px] px-2"
      />
    );
  }

  return (
    <BreadcrumbItem
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:text-foreground transition-colors"
    >
      {workflow.name}
    </BreadcrumbItem>
  );
}
```

**Props:**
- `workflowId`: Workflow ID from route params

**Features:**
- Click to edit mode
- Auto-focus and select text on edit
- Save on blur or Enter key
- Cancel on Escape key
- Revert to original name on error
- Disabled during mutation
- Min width for better UX

**State Management:**
- `isEditing`: Toggle between view and edit modes
- `name`: Local state synced with workflow name
- `inputRef`: Reference for auto-focus

### EditorSaveButton

Save button for workflow changes (placeholder for future implementation).

**File:** `features/editor/components/editor-header.tsx`

```typescript
import { Button } from '@/components/ui/button';
import { SaveIcon } from 'lucide-react';

export function EditorSaveButton({ workflowId }: { workflowId: string }) {
  return (
    <div className="ml-auto">
      <Button size="sm" onClick={() => {}} disabled={false}>
        <SaveIcon className="size-4" />
        Save
      </Button>
    </div>
  );
}
```

**Props:**
- `workflowId`: Workflow ID from route params

**Features:**
- Save icon from lucide-react
- Small button size
- Positioned at right end with `ml-auto`
- Currently placeholder implementation

### Editor

Main editor component that will contain the workflow canvas.

**File:** `features/editor/components/editor.tsx`

```typescript
'use client';

import React from 'react';
import { useSuspenseWorkflow } from '@/features/workflows/hooks/use-workflows';
import { ErrorView, LoadingView } from '@/components/entity-components';

export function EditorLoading() {
  return <LoadingView message="Loading editor..." />;
}

export function EditorError() {
  return <ErrorView message="Error loading editor" />;
}

function Editor({ workflowId }: { workflowId: string }) {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  return <p>{JSON.stringify(workflow, null, 2)}</p>;
}

export default Editor;
```

**Props:**
- `workflowId`: Workflow ID from route params

**Current Implementation:**
- Fetches workflow data using `useSuspenseWorkflow`
- Displays workflow JSON (placeholder)
- Ready for workflow canvas integration

**State Components:**
- `EditorLoading`: Loading state with spinner
- `EditorError`: Error state with error icon

---

## Data Fetching

### Server-Side Prefetch

The editor page uses server-side prefetching to ensure instant rendering:

**File:** `features/workflows/server/prefetch.ts`

```typescript
import type { inferInput } from '@trpc/tanstack-react-query';
import { prefetch, trpc } from '@/trpc/server';

/**
 * Prefetch single workflow by ID
 */
export const prefetchWorkflow = (id: string) => {
  return prefetch(trpc.workflows.getOne.queryOptions({ id }));
};
```

### Client-Side Hooks

**useSuspenseWorkflow**

Fetches a single workflow using React Query suspense mode.

**File:** `features/workflows/hooks/use-workflows.ts`

```typescript
/**
 * Hook to fetch a single workflow using suspense
 */
export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.workflows.getOne.queryOptions({
      id,
    })
  );
};
```

**useUpdateWorkflowName**

Updates a workflow's name with optimistic UI updates.

**File:** `features/workflows/hooks/use-workflows.ts`

```typescript
/**
 * Hook to update a workflow name
 */
export const useUpdateWorkflowName = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" updated.`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to update workflow: ${error.message}`);
      },
    })
  );
};
```

**Features:**
- Toast notifications on success/error
- Cache invalidation for both list and detail views
- Type-safe mutations with tRPC

---

## Implementation Details

### Page Component

**File:** `app/(dashboard)/(editor)/workflows/[workflowId]/page.tsx`

```typescript
import Editor, {
  EditorError,
  EditorLoading,
} from '@/features/editor/components/editor';
import EditorHeader from '@/features/editor/components/editor-header';
import { prefetchWorkflow } from '@/features/workflows/server/prefetch';
import { requireAuth } from '@/lib/auth-utils';
import { HydrateClient } from '@/trpc/server';
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

async function WorkflowDetailPage({ params }: PageProps) {
  await requireAuth();

  const { workflowId } = await params;
  prefetchWorkflow(workflowId);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoading />}>
          <EditorHeader workflowId={workflowId} />
          <main className="flex-1">
            <Editor workflowId={workflowId} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}

export default WorkflowDetailPage;
```

**Page Structure:**

1. **Authentication**: `requireAuth()` ensures user is logged in
2. **Params Extraction**: Extract `workflowId` from route params
3. **Prefetch**: Server-side prefetch workflow data
4. **HydrateClient**: Provides React Query hydration
5. **ErrorBoundary**: Catches errors with `EditorError` fallback
6. **Suspense**: Handles loading states with `EditorLoading` fallback
7. **Layout**: Header + main content area

### Route Structure

The editor is in a separate route group to exclude the dashboard header:

```
app/(dashboard)/
├── layout.tsx              # Dashboard layout with sidebar
├── (home)/                 # Routes with header
│   ├── layout.tsx          # Includes AppHeader
│   ├── workflows/
│   ├── credentials/
│   └── executions/
└── (editor)/               # Routes without header
    └── workflows/[workflowId]/
        └── page.tsx        # Editor page
```

**Benefits:**
- Maximizes editor screen space
- Still includes sidebar for navigation
- Consistent dashboard layout

### Data Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Page as WorkflowDetailPage
    participant Auth as requireAuth
    participant Prefetch as prefetchWorkflow
    participant Router as workflowsRouter
    participant Prisma
    participant DB
    participant Component as Editor
    participant Hook as useSuspenseWorkflow
    participant Query as React Query

    Browser->>Page: GET /workflows/[id]
    Page->>Auth: Check authentication
    Auth-->>Page: User session
    Page->>Prefetch: prefetchWorkflow(id)
    Prefetch->>Router: trpc.workflows.getOne
    Router->>Prisma: findUnique({ id, userId })
    Prisma->>DB: SELECT * FROM Workflow WHERE id = ?
    DB-->>Prisma: Workflow
    Prisma-->>Router: Workflow
    Router-->>Query: Cache data
    Page->>Component: Render Editor
    Component->>Hook: useSuspenseWorkflow(id)
    Hook->>Query: Check cache
    Query-->>Hook: Return cached data
    Hook-->>Component: workflow.data
    Component->>Component: Render UI

    Note over Browser: No loading state!
```

---

## Best Practices

### 1. Always Prefetch on Server

```typescript
// ✅ Good: Prefetch on server for instant render
async function WorkflowDetailPage({ params }) {
  await requireAuth();
  const { workflowId } = await params;
  prefetchWorkflow(workflowId);  // No loading state!
  return <Editor workflowId={workflowId} />;
}

// ❌ Bad: Client-only fetch shows loading spinner
function WorkflowDetailPage({ params }) {
  return <Editor workflowId={params.workflowId} />;
}
```

### 2. Use Suspense for Client Components

```typescript
// ✅ Good: Suspense handles loading states
<Suspense fallback={<EditorLoading />}>
  <Editor workflowId={workflowId} />
</Suspense>

// ❌ Bad: No loading state handling
<Editor workflowId={workflowId} />
```

### 3. Validate Input in Inline Editors

```typescript
// ✅ Good: Only save if name changed
const handleSave = async () => {
  if (name === workflow.name) {
    setIsEditing(false);
    return;
  }
  await updateWorkflow.mutateAsync({ id, name });
};

// ❌ Bad: Always makes API call
const handleSave = async () => {
  await updateWorkflow.mutateAsync({ id, name });
};
```

### 4. Handle Errors Gracefully

```typescript
// ✅ Good: Revert on error
try {
  await updateWorkflow.mutateAsync({ id, name });
} catch {
  setName(workflow.name);  // Revert to original
} finally {
  setIsEditing(false);
}

// ❌ Bad: Leave user in editing state on error
await updateWorkflow.mutateAsync({ id, name });
setIsEditing(false);
```

### 5. Auto-Focus and Select on Edit

```typescript
// ✅ Good: Better UX with auto-focus and select
useEffect(() => {
  if (isEditing && inputRef.current) {
    inputRef.current.focus();
    inputRef.current.select();
  }
}, [isEditing]);

// ❌ Bad: User must manually select text
useEffect(() => {
  if (isEditing && inputRef.current) {
    inputRef.current.focus();
  }
}, [isEditing]);
```

---

## Future Enhancements

### 1. Workflow Canvas

Replace the JSON placeholder with a visual workflow canvas:
- Node-based workflow builder
- Drag-and-drop interface
- Connection lines between nodes
- Node configuration panels

### 2. Save Functionality

Implement the save button:
- Auto-save on changes
- Save indicator (saved/unsaved)
- Keyboard shortcut (Cmd/Ctrl + S)
- Version history

### 3. Collaboration

Add real-time collaboration features:
- Multi-user editing
- Presence indicators
- Conflict resolution
- Change notifications

### 4. Toolbar

Add a toolbar with common actions:
- Undo/redo
- Zoom controls
- Layout options
- Export workflow

---

## Related Documentation

- [Workflows Feature](./workflows-feature.md) - Workflows list and CRUD operations
- [Data Fetching Pattern](./data-fetching-pattern.md) - tRPC + React Query guide
- [Generic Components](./generic-components.md) - Reusable entity component patterns
- [Dashboard Layout and Navigation](./dashboard-layout-navigation.md) - Layout system
