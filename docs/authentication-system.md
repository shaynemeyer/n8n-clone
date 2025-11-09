# Authentication System Documentation

## Overview

This application uses [Better Auth](https://www.better-auth.com/) - a modern authentication library for TypeScript/JavaScript applications. Better Auth provides a comprehensive authentication solution with built-in session management, multiple authentication methods, and database integration.

### Key Features

- Email/Password authentication with auto sign-in
- Database-backed sessions using PostgreSQL
- Protected routes and API endpoints
- TRPC integration with authentication middleware
- Client-side and server-side authentication utilities
- Ready for OAuth integration (GitHub, Google)

### Tech Stack

- **Auth Library**: Better Auth
- **Database**: PostgreSQL via Prisma ORM
- **Session Storage**: Database (Better Auth handles session tokens via cookies)
- **Form Validation**: React Hook Form + Zod
- **UI Framework**: React 19 with Next.js 15

---

## Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Login/Signup Forms]
        B[Auth Client]
        C[Protected UI Components]
    end

    subgraph "API Layer"
        D["API Route Handler<br/>/api/auth/*"]
        E[Better Auth Core]
        F[TRPC Protected Procedures]
    end

    subgraph "Server Utilities"
        G[requireAuth Helper]
        H[requireUnauth Helper]
        I[Protected Procedure Middleware]
    end

    subgraph "Database Layer"
        J[(PostgreSQL)]
        K[User Table]
        L[Session Table]
        M[Account Table]
        N[Verification Table]
    end

    A -->|signIn/signUp| B
    B -->|POST request| D
    D -->|processes| E
    E -->|Prisma Adapter| J
    J --> K
    J --> L
    J --> M
    J --> N
    G -->|getSession| E
    H -->|getSession| E
    I -->|getSession| E
    C -->|uses| G
    F -->|protected by| I
```

---

## Database Schema

The authentication system uses four main database tables defined in the Prisma schema:

### User Model
```prisma
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
}
```

**Purpose**: Stores core user information and serves as the primary identity record.

### Session Model
```prisma
model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Purpose**: Stores active user sessions. Better Auth creates a new session on login and validates it on each request.

### Account Model
```prisma
model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?   # Hashed password for email/password auth
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

**Purpose**: Stores authentication provider accounts (email/password or OAuth providers like GitHub/Google).

### Verification Model
```prisma
model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Purpose**: Stores verification tokens for email verification, password resets, etc.

---

## Core Configuration

### 1. Server-Side Auth Configuration

**File**: `lib/auth.ts`

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,  // Automatically signs in after successful signup
  },
});
```

**Key Points**:
- Uses Prisma adapter for PostgreSQL integration
- Email/password authentication enabled with auto sign-in
- Better Auth automatically manages session creation, validation, and cleanup

### 2. Client-Side Auth Client

**File**: `lib/auth-client.ts`

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();
```

**Key Points**:
- Provides React hooks and methods for authentication
- Automatically includes session cookies in requests
- Methods: `signIn.email()`, `signUp.email()`, `signOut()`, `useSession()`, etc.

### 3. API Route Handler

**File**: `app/api/auth/[...all]/route.ts`

```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
```

**Key Points**:
- Catch-all route handles all Better Auth endpoints
- Endpoints include: `/api/auth/sign-in/email`, `/api/auth/sign-up/email`, `/api/auth/sign-out`, `/api/auth/get-session`, etc.
- Better Auth handles all authentication logic internally

---

## Authentication Flows

### Signup Flow

```mermaid
sequenceDiagram
    participant User
    participant SignupForm
    participant AuthClient
    participant API as /api/auth/sign-up/email
    participant BetterAuth
    participant DB as Database
    participant Router

    User->>SignupForm: Enter email, password
    SignupForm->>SignupForm: Validate with Zod schema
    SignupForm->>SignupForm: Check password === confirmPassword

    alt Validation Failed
        SignupForm-->>User: Show validation errors
    else Validation Passed
        SignupForm->>AuthClient: authClient.signUp.email({email, password})
        AuthClient->>API: POST request with credentials
        API->>BetterAuth: Process signup
        BetterAuth->>BetterAuth: Hash password (bcrypt)
        BetterAuth->>DB: Create User record
        BetterAuth->>DB: Create Account record (password)

        Note over BetterAuth,DB: autoSignIn: true enabled
        BetterAuth->>DB: Create Session record
        BetterAuth->>API: Return session + Set-Cookie header
        API->>AuthClient: Success response + session cookie

        AuthClient->>SignupForm: onSuccess callback
        SignupForm->>Router: router.push('/')
        Router-->>User: Redirect to home (authenticated)
    end
```

**Step-by-Step Breakdown**:

1. **User Input** (`signup-form.tsx:54-71`)
   - User fills email, password, confirmPassword fields
   - React Hook Form tracks form state

2. **Client-Side Validation** (`signup-form.tsx:30-39`)
   ```typescript
   const signupSchema = z.object({
     email: z.email('Please enter a valid email address'),
     password: z.string().min(1, 'Password is required'),
     confirmPassword: z.string(),
   }).refine((data) => data.password === data.confirmPassword, {
     message: "Passwords don't match",
     path: ['confirmPassword'],
   });
   ```

3. **API Call** (`signup-form.tsx:55-60`)
   ```typescript
   await authClient.signUp.email({
     name: values.email,
     email: values.email,
     password: values.password,
     callbackURL: '/',
   })
   ```

4. **Better Auth Processing**
   - Validates email uniqueness
   - Hashes password using bcrypt
   - Creates User record in database
   - Creates Account record with hashed password
   - **Auto sign-in**: Creates Session record
   - Generates session token
   - Sets HTTP-only session cookie

5. **Success Handling** (`signup-form.tsx:63-64`)
   - onSuccess callback executes
   - Redirects to home page
   - User is now authenticated

6. **Error Handling** (`signup-form.tsx:66-68`)
   ```typescript
   onError: (ctx) => {
     toast.error(ctx.error.message);
   }
   ```

---

### Login Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginForm
    participant AuthClient
    participant API as /api/auth/sign-in/email
    participant BetterAuth
    participant DB as Database
    participant Router

    User->>LoginForm: Enter email, password
    LoginForm->>LoginForm: Validate with Zod schema

    alt Validation Failed
        LoginForm-->>User: Show validation errors
    else Validation Passed
        LoginForm->>AuthClient: authClient.signIn.email({email, password})
        AuthClient->>API: POST request with credentials
        API->>BetterAuth: Process sign-in
        BetterAuth->>DB: Find User by email

        alt User Not Found
            BetterAuth-->>API: Error: Invalid credentials
            API-->>AuthClient: Error response
            AuthClient->>LoginForm: onError callback
            LoginForm-->>User: Show error toast
        else User Found
            BetterAuth->>DB: Find Account record
            BetterAuth->>BetterAuth: Compare password hash

            alt Password Incorrect
                BetterAuth-->>API: Error: Invalid credentials
                API-->>AuthClient: Error response
                AuthClient->>LoginForm: onError callback
                LoginForm-->>User: Show error toast
            else Password Correct
                BetterAuth->>DB: Create Session record
                BetterAuth->>BetterAuth: Generate session token
                BetterAuth->>API: Return session + Set-Cookie
                API->>AuthClient: Success + session cookie
                AuthClient->>LoginForm: onSuccess callback
                LoginForm->>Router: router.push('/')
                Router-->>User: Redirect to home (authenticated)
            end
        end
    end
```

**Step-by-Step Breakdown**:

1. **User Input** (`login-form.tsx:45-61`)
   - User enters email and password
   - Form validation with Zod schema

2. **Client-Side Validation** (`login-form.tsx:28-31`)
   ```typescript
   const loginSchema = z.object({
     email: z.email('Please enter a valid email address'),
     password: z.string().min(1, 'Password is required'),
   });
   ```

3. **API Call** (`login-form.tsx:46-50`)
   ```typescript
   await authClient.signIn.email({
     email: values.email,
     password: values.password,
     callbackURL: '/',
   })
   ```

4. **Better Auth Processing**
   - Looks up user by email in database
   - Retrieves associated Account record
   - Compares provided password with stored hash using bcrypt
   - If valid:
     - Creates new Session record with expiration
     - Generates unique session token
     - Sets HTTP-only cookie with session token
     - Returns session data

5. **Success Handling** (`login-form.tsx:53-55`)
   - onSuccess callback executes
   - Client redirects to home page
   - Session cookie is automatically included in future requests

6. **Error Handling** (`login-form.tsx:56-58`)
   ```typescript
   onError: (ctx) => {
     toast.error(ctx.error.message);
   }
   ```

---

### Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant AuthClient
    participant API as /api/auth/sign-out
    participant BetterAuth
    participant DB as Database
    participant Router

    User->>Component: Click logout button
    Component->>AuthClient: authClient.signOut()
    AuthClient->>API: POST with session cookie
    API->>BetterAuth: Process sign-out
    BetterAuth->>BetterAuth: Extract session token from cookie
    BetterAuth->>DB: Delete Session record
    BetterAuth->>API: Return + Clear session cookie
    API->>AuthClient: Success response
    AuthClient->>Router: Redirect to /login
    Router-->>User: Logged out, show login page
```

**Step-by-Step Breakdown**:

1. **User Action**
   - User clicks logout/sign out button in UI

2. **Client Call**
   ```typescript
   await authClient.signOut();
   ```

3. **Better Auth Processing**
   - Extracts session token from HTTP-only cookie
   - Finds and deletes Session record from database
   - Clears session cookie (sets expiration to past date)
   - Returns success response

4. **Post-Logout**
   - User is redirected to login page
   - All subsequent requests are unauthenticated
   - Protected routes will redirect to /login

**Note**: While logout functionality is not currently implemented in the UI, Better Auth provides the `authClient.signOut()` method that can be called from any component.

---

## Protected Routes & Middleware

### Server-Side Route Protection

**File**: `lib/auth-utils.ts`

#### requireAuth()

Used to protect pages that require authentication.

```typescript
export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return session;
};
```

**Usage Example**:
```typescript
// app/(protected)/dashboard/page.tsx
import { requireAuth } from '@/lib/auth-utils';

export default async function DashboardPage() {
  const session = await requireAuth(); // Redirects if not authenticated

  return <div>Welcome {session.user.name}</div>;
}
```

**Flow**:
```mermaid
graph TD
    A[User Requests Protected Page] --> B{getSession from headers}
    B -->|Session Found| C[Return Session Data]
    B -->|No Session| D[redirect to /login]
    C --> E[Render Protected Page]
    D --> F[Show Login Page]
```

#### requireUnauth()

Prevents authenticated users from accessing login/signup pages.

```typescript
export const requireUnauth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect('/');
  }
};
```

**Usage Example**:
```typescript
// app/(auth)/login/page.tsx
import { requireUnauth } from '@/lib/auth-utils';

export default async function LoginPage() {
  await requireUnauth(); // Redirects to home if already logged in

  return <LoginForm />;
}
```

**Flow**:
```mermaid
graph TD
    A[User Requests Login/Signup Page] --> B{getSession from headers}
    B -->|Session Found| C[redirect to /]
    B -->|No Session| D[Allow Access]
    C --> E[Show Home Page]
    D --> F[Show Login/Signup Form]
```

---

### TRPC Protected Procedures

**File**: `trpc/init.ts`

Protected procedures ensure only authenticated users can access certain TRPC endpoints.

```typescript
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  }

  return next({ ctx: { ...ctx, auth: session } });
});
```

**Usage Example** (`trpc/routers/_app.ts:5-7`):
```typescript
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(() => {
    return prisma.user.findMany();
  }),
});
```

**Flow**:
```mermaid
sequenceDiagram
    participant Client
    participant TRPC
    participant Middleware as protectedProcedure
    participant BetterAuth
    participant Handler as Query/Mutation
    participant DB

    Client->>TRPC: Request (with session cookie)
    TRPC->>Middleware: Execute middleware
    Middleware->>BetterAuth: getSession(headers)

    alt No Session
        BetterAuth-->>Middleware: null
        Middleware-->>TRPC: TRPCError: UNAUTHORIZED
        TRPC-->>Client: 401 Error
    else Valid Session
        BetterAuth-->>Middleware: Session data
        Middleware->>Handler: next({ ctx: { auth: session }})
        Handler->>DB: Execute query/mutation
        DB-->>Handler: Data
        Handler-->>TRPC: Result
        TRPC-->>Client: Success response
    end
```

**Key Points**:
- Session data is available in context via `ctx.auth`
- Access user info: `ctx.auth.user.id`, `ctx.auth.user.email`, etc.
- Automatically throws UNAUTHORIZED error if no valid session
- Session validation happens on every protected procedure call

---

## Session Management

### How Sessions Work

Better Auth uses a **database-backed session** strategy:

1. **Session Creation**
   - When user logs in or signs up, Better Auth creates a Session record
   - Session includes:
     - Unique session ID
     - Session token (random secure string)
     - Expiration timestamp
     - User ID (foreign key to User)
     - IP address and User Agent (optional metadata)

2. **Session Storage**
   - Session token is stored in an **HTTP-only cookie**
   - Cookie name: `better-auth.session_token` (configurable)
   - HTTP-only flag prevents JavaScript access (XSS protection)
   - Secure flag ensures HTTPS-only transmission in production
   - SameSite attribute prevents CSRF attacks

3. **Session Validation**
   - On each request, Better Auth reads the session token from cookie
   - Looks up Session record in database
   - Checks if session is expired
   - Returns user data if valid, null if invalid/expired

4. **Session Lifecycle**
   ```mermaid
   stateDiagram-v2
       [*] --> Created: Login/Signup
       Created --> Active: Session token in cookie
       Active --> Active: Valid requests
       Active --> Expired: Time passes
       Active --> Deleted: Explicit logout
       Expired --> [*]
       Deleted --> [*]
   ```

### Session Expiration

- Default expiration configured by Better Auth (typically 7-30 days)
- Can be customized in `lib/auth.ts` configuration
- Expired sessions are automatically rejected
- Better Auth can implement sliding sessions (extend expiration on activity)

### Session Security Features

- **HTTP-Only Cookies**: JavaScript cannot access tokens (prevents XSS)
- **Secure Flag**: Only transmitted over HTTPS in production
- **SameSite Attribute**: Prevents CSRF attacks
- **Token Rotation**: New token generated on sensitive operations
- **Database Validation**: Every request validates against database
- **IP & User Agent Tracking**: Detect suspicious session usage

---

## Security Considerations

### Password Security

- **Hashing**: Better Auth uses bcrypt with automatic salt generation
- **Storage**: Hashed passwords stored in `Account.password` field
- **Validation**: Constant-time comparison prevents timing attacks

### Token Security

- **Generation**: Cryptographically secure random tokens
- **Storage**: HTTP-only cookies (not accessible via JavaScript)
- **Transmission**: HTTPS in production (secure flag)
- **Validation**: Database lookup on every request

### CSRF Protection

- **SameSite Cookies**: Prevents cross-site request forgery
- **Origin Validation**: Better Auth validates request origin
- **CORS Configuration**: Restrict allowed origins in production

### XSS Protection

- **HTTP-Only Cookies**: Tokens not accessible to JavaScript
- **Input Sanitization**: Validate all user inputs with Zod schemas
- **Output Encoding**: React automatically escapes rendered content

### Database Security

- **Prepared Statements**: Prisma uses parameterized queries (prevents SQL injection)
- **Cascade Deletes**: Sessions and Accounts deleted when User is deleted
- **Unique Constraints**: Email uniqueness enforced at database level

---

## Environment Variables

Required variables in `.env`:

```bash
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Better Auth secret (used for token generation)
BETTER_AUTH_SECRET="your-random-secret-key-here"

# Base URL of application
BETTER_AUTH_URL="http://localhost:3000"
```

**Security Notes**:
- Never commit `.env` to version control
- Use different secrets for dev/staging/production
- `BETTER_AUTH_SECRET` should be a long random string (32+ characters)
- Rotate secrets periodically in production

---

## API Endpoints

Better Auth automatically creates these endpoints via `/api/auth/[...all]/route.ts`:

### Authentication Endpoints

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/api/auth/sign-up/email` | POST | Register new user | `{ email, password, name }` |
| `/api/auth/sign-in/email` | POST | Login user | `{ email, password }` |
| `/api/auth/sign-out` | POST | Logout user | None |

### Session Endpoints

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/api/auth/get-session` | GET | Get current session | None |
| `/api/auth/refresh-session` | POST | Refresh session token | None |

### Account Management (Future)

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/api/auth/verify-email` | POST | Verify email address | `{ token }` |
| `/api/auth/forgot-password` | POST | Request password reset | `{ email }` |
| `/api/auth/reset-password` | POST | Reset password | `{ token, password }` |

---

## Client-Side Usage

### Using Auth Client in Components

```typescript
import { authClient } from '@/lib/auth-client';

// Sign up
await authClient.signUp.email({
  email: 'user@example.com',
  password: 'securepassword',
  name: 'User Name',
});

// Sign in
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'securepassword',
});

// Sign out
await authClient.signOut();

// Get current session (React hook)
function MyComponent() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Hello {session.user.name}</div>;
}
```

---

## Common Patterns

### Pattern 1: Protected Page Component

```typescript
// app/(protected)/profile/page.tsx
import { requireAuth } from '@/lib/auth-utils';

export default async function ProfilePage() {
  const session = await requireAuth();

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {session.user.email}</p>
      <p>Name: {session.user.name}</p>
    </div>
  );
}
```

### Pattern 2: Protected TRPC Procedure

```typescript
// trpc/routers/_app.ts
import { createTRPCRouter, protectedProcedure } from '../init';

export const appRouter = createTRPCRouter({
  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    return prisma.user.findUnique({
      where: { id: ctx.auth.user.id },
      include: { posts: true },
    });
  }),
});
```

### Pattern 3: Conditional UI Based on Auth

```typescript
'use client';
import { authClient } from '@/lib/auth-client';

export function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header>
      {session ? (
        <button onClick={() => authClient.signOut()}>Logout</button>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

---

## Future Enhancements

### OAuth Integration

The UI already includes placeholder buttons for GitHub and Google OAuth. To enable:

1. **Install OAuth Plugins**
   ```bash
   npm install better-auth-oauth-github better-auth-oauth-google
   ```

2. **Update Configuration** (`lib/auth.ts`)
   ```typescript
   export const auth = betterAuth({
     database: prismaAdapter(prisma, { provider: 'postgresql' }),
     emailAndPassword: { enabled: true, autoSignIn: true },
     socialProviders: {
       github: {
         clientId: process.env.GITHUB_CLIENT_ID,
         clientSecret: process.env.GITHUB_CLIENT_SECRET,
       },
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       },
     },
   });
   ```

3. **Connect Buttons** (`login-form.tsx`, `signup-form.tsx`)
   ```typescript
   <Button onClick={() => authClient.signIn.social({ provider: 'github' })}>
     Continue with GitHub
   </Button>
   ```

### Email Verification

Enable email verification for new signups:

```typescript
export const auth = betterAuth({
  // ... existing config
  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    sendEmail: async (user, url) => {
      // Send verification email via email service (SendGrid, Resend, etc.)
    },
  },
});
```

### Two-Factor Authentication (2FA)

Add extra security layer:

```typescript
export const auth = betterAuth({
  // ... existing config
  twoFactor: {
    enabled: true,
    issuer: 'YourAppName',
  },
});
```

### Password Reset Flow

Implement forgot password functionality:

```typescript
// Client side
await authClient.forgetPassword({ email: 'user@example.com' });

// User receives email, clicks link
await authClient.resetPassword({
  token: 'reset-token-from-email',
  password: 'newpassword',
});
```

---

## Troubleshooting

### Common Issues

**Issue**: "Session not found" error on protected routes
- **Cause**: Cookie not being sent or session expired
- **Solution**: Check browser cookies, ensure `BETTER_AUTH_URL` matches your domain

**Issue**: CORS errors when calling auth endpoints
- **Cause**: Mismatched origins in development
- **Solution**: Ensure client and API run on same port, or configure CORS in `lib/auth.ts`

**Issue**: "Database error" on signup
- **Cause**: Missing database tables or incorrect schema
- **Solution**: Run `npx prisma migrate dev` to sync schema

**Issue**: Password hash errors
- **Cause**: bcrypt compatibility issues
- **Solution**: Ensure `better-auth` is up to date, check Node.js version compatibility

### Debug Mode

Enable debug logging:

```typescript
export const auth = betterAuth({
  // ... existing config
  advanced: {
    debug: process.env.NODE_ENV === 'development',
  },
});
```

---

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)

---

## File Reference

### Core Files

- `lib/auth.ts` - Better Auth server configuration
- `lib/auth-client.ts` - Better Auth client initialization
- `lib/auth-utils.ts` - Server-side authentication utilities
- `app/api/auth/[...all]/route.ts` - API route handler
- `trpc/init.ts` - TRPC protected procedure middleware

### UI Components

- `app/features/auth/components/login-form.tsx` - Login form component
- `app/features/auth/components/signup-form.tsx` - Signup form component
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup page

### Database

- `prisma/schema.prisma` - Database schema with User, Session, Account, Verification models

---

*Last Updated: 2025-11-09*
