# DevBoard — Project Concepts & Architecture Guide

A complete explanation of every concept, pattern, and technology used in this project.
Written for someone learning React — every term is explained before it is used.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Architecture](#2-folder-architecture)
3. [Vite & Build Config](#3-vite--build-config)
4. [TypeScript](#4-typescript)
5. [Redux Toolkit — Global State](#5-redux-toolkit--global-state)
6. [RTK Query — Async Data Fetching](#6-rtk-query--async-data-fetching)
7. [React Context API — Lightweight Global State](#7-react-context-api--lightweight-global-state)
8. [React Router v7 — Navigation](#8-react-router-v7--navigation)
9. [React Hook Form + Zod — Forms & Validation](#9-react-hook-form--zod--forms--validation)
10. [Atomic Design — Component Architecture](#10-atomic-design--component-architecture)
11. [Performance Patterns](#11-performance-patterns)
12. [Sentry — Error Monitoring](#12-sentry--error-monitoring)
13. [React Portals — Modals & Toasts](#13-react-portals--modals--toasts)
14. [Tailwind CSS v4 — Styling](#14-tailwind-css-v4--styling)
15. [Recharts — Data Visualisation](#15-recharts--data-visualisation)
16. [Data Flow Examples](#16-data-flow-examples)

---

## 1. Project Overview

**DevBoard** is a project management dashboard — think a simplified Jira or Trello.

### What it does
- Kanban board to manage tasks (drag & drop between columns)
- Dashboard with live stats and activity feed
- Analytics page with charts
- Team management (invite, assign roles)
- Authentication (login / protected routes)
- Dark mode

### Tech stack at a glance

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 8 |
| Global State | Redux Toolkit |
| Async Data | RTK Query |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Error Monitoring | Sentry |
| Performance | react-window (virtualization) |

---

## 2. Folder Architecture

The project uses **Feature-Driven Modular Architecture** combined with **Atomic Design** for UI components.

### The core idea

Think of it like organising a house:
- `src/features/` = rooms (each room is self-contained: bedroom has its own furniture)
- `src/components/` = shared furniture that can go in any room (sofa, lamp)
- `src/store/` = the electrical box that powers the whole house (global state)

```
src/
├── api/                  # Axios instance & interceptors (HTTP client setup)
├── assets/               # Images, fonts, icons
├── components/           # Shared UI — usable in ANY feature
│   ├── atoms/            # Tiny building blocks: Button, Input, Label, Badge
│   ├── molecules/        # Atom combos: FormField, SearchBar
│   └── organisms/        # Complex components: Modal, Toast, ErrorBoundary
├── features/             # Self-contained feature modules
│   ├── auth/             # Login, ProtectedRoute, AuthContext, ThemeContext
│   ├── board/            # Kanban board, boardSlice, TaskCard
│   ├── dashboard/        # Dashboard page, RTK Query API, stats
│   ├── analytics/        # Charts, TaskListPage with virtualization
│   └── team/             # Team page, teamSlice, InviteMemberForm
├── hooks/                # Global reusable custom hooks
├── layouts/              # App-level layout (sidebar + main area)
├── services/             # Sentry setup
├── store/                # Redux store + typed hooks
├── styles/               # Global CSS
├── types/                # Shared TypeScript types (User, Task, etc.)
├── utils/                # Helper functions (cn)
├── App.tsx               # Root component: providers + routes
└── main.tsx              # Entry point: init Sentry → render React
```

### Feature module rule

Each feature (e.g. `board`) owns everything it needs:
- `components/` — UI specific to this feature
- `hooks/` — logic specific to this feature
- `api.ts` — API calls specific to this feature
- `[feature]Slice.ts` — Redux state for this feature
- `index.tsx` — public export (what other parts of the app can import)

Features do NOT import from each other directly. Shared UI goes into `src/components/`.

---

## 3. Vite & Build Config

**File:** `vite.config.ts`

### What is Vite?

Vite is the build tool — it compiles your TypeScript + React code into browser-ready JavaScript. Think of it as the factory that takes your source code and produces the final product.

### Path Aliases

Without aliases you'd write:
```typescript
import Button from '../../../components/atoms/Button'
```

With aliases configured in `vite.config.ts`:
```typescript
import Button from '@components/atoms/Button'
```

The aliases defined:

| Alias | Points to |
|-------|-----------|
| `@` | `src/` |
| `@components` | `src/components/` |
| `@features` | `src/features/` |
| `@store` | `src/store/` |
| `@hooks` | `src/hooks/` |
| `@utils` | `src/utils/` |
| `@services` | `src/services/` |
| `@app-types` | `src/types/` |

> These must also be declared in `tsconfig.app.json` under `paths` so TypeScript understands them too.

### Manual Chunk Splitting

When Vite builds the app, it bundles everything into JS files. By default all third-party libraries end up in one giant file. Manual chunks split them:

```typescript
manualChunks: {
  'vendor-react':  ['react', 'react-dom'],       // ~120KB
  'vendor-router': ['react-router-dom'],          // ~25KB
  'vendor-redux':  ['@reduxjs/toolkit', 'react-redux'], // ~55KB
  'vendor-forms':  ['react-hook-form', 'zod', '@hookform/resolvers'],
  'vendor-charts': ['recharts'],                  // ~220KB
  'vendor-sentry': ['@sentry/react'],             // ~80KB
}
```

**Why?** The browser caches each file separately. If you update only your app code, the browser re-downloads only your app chunk — not the vendor libraries. Faster repeat visits.

### Source Maps

```typescript
build: { sourcemap: true }
```

Source maps are files that map minified production code back to your original TypeScript. Sentry uses them to show you the real line of code that crashed, not minified gibberish.

### Sentry Vite Plugin

During `npm run build`, the plugin:
1. Uploads source maps to Sentry servers
2. Deletes `.map` files from `dist/` so they aren't publicly accessible

---

## 4. TypeScript

TypeScript is JavaScript with types. Types tell the editor (and you) what shape data is supposed to have — catching bugs before the code even runs.

### Strict Mode

`tsconfig.app.json` has `"strict": true`. This enables the strictest checks — if you forget to handle the case where a value might be `null`, TypeScript will warn you.

### Interfaces — Shared Types

**File:** `src/types/index.ts`

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'developer' | 'viewer'; // only these 3 values allowed
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  createdAt: string;
  tag: string;
}
```

These types are imported wherever Users or Tasks are used — TypeScript then enforces the shape automatically.

### Environment Variable Types

**File:** `src/env.d.ts`

```typescript
interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string | undefined;
  readonly VITE_APP_VERSION: string;
  // ...
}
```

This tells TypeScript what variables exist in `.env` files — so `import.meta.env.VITE_SENTRY_DSN` gets proper autocomplete and type checking.

---

## 5. Redux Toolkit — Global State

### What is Redux?

Redux is a place to store data that multiple components need to share. Think of it as a single shared whiteboard in an office — anyone can read it, and changes go through a defined process so everything stays consistent.

Without Redux, you'd have to pass data through many layers of components (called "prop drilling") — very messy for a large app.

### Redux Toolkit (RTK)

RTK is the official modern way to use Redux. It removes a lot of boilerplate code. It uses **Immer** internally, which lets you write code that looks like it's mutating data directly (easier to read) but actually creates immutable copies under the hood.

### Store Setup

**File:** `src/store/index.ts`

```typescript
export const store = configureStore({
  reducer: {
    board: boardSlice.reducer,   // handles task state
    team: teamSlice.reducer,     // handles team member state
    [dashboardApi.reducerPath]: dashboardApi.reducer, // RTK Query cache
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dashboardApi.middleware),
})
```

The store combines all slices. `configureStore` also sets up Redux DevTools automatically (browser extension for debugging).

### Slices — State + Actions Together

A "slice" manages one piece of the global state. It bundles:
- The initial state
- Reducers (functions that change state)
- Auto-generated action creators

**File:** `src/features/board/boardSlice.ts`

```typescript
const boardSlice = createSlice({
  name: 'board',
  initialState: { tasks: [...mockTasks] },
  reducers: {
    addTask(state, action) {
      state.tasks.push(action.payload) // Immer makes this safe
    },
    deleteTask(state, action) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },
    moveTask(state, action) {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) task.status = action.payload.newStatus
    },
  },
})

export const { addTask, deleteTask, moveTask } = boardSlice.actions
```

### Typed Hooks

**File:** `src/store/hooks.ts`

```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector)
```

These are wrappers around Redux's `useDispatch` and `useSelector` that are pre-typed for this app. Every component uses these instead of the raw Redux hooks.

**Reading state in a component:**
```typescript
const tasks = useAppSelector(state => state.board.tasks)
```

**Dispatching an action:**
```typescript
const dispatch = useAppDispatch()
dispatch(addTask(newTaskData))
```

---

## 6. RTK Query — Async Data Fetching

### What is RTK Query?

RTK Query is built into Redux Toolkit. It handles fetching data from an API — including loading states, caching, and background refetching — with almost no boilerplate.

Think of it like a smart cache that knows when to fetch fresh data and when to serve what it already has.

### Setup in this project

**File:** `src/features/dashboard/api.ts`

The project uses `fakeBaseQuery` (returns mock data with a simulated delay) instead of a real API. In a production app, you'd use `fetchBaseQuery` pointing to your backend URL.

```typescript
export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getStats: builder.query({
      queryFn: async () => {
        await delay(800) // simulates network latency
        return { data: mockStats }
      },
    }),
    getActivity: builder.query({
      queryFn: async () => {
        await delay(600)
        return { data: mockActivity }
      },
    }),
  }),
})

export const { useGetStatsQuery, useGetActivityQuery } = dashboardApi
```

### Using a query in a component

**File:** `src/features/dashboard/DashboardPage.tsx`

```typescript
const { data: stats, isLoading, isError } = useGetStatsQuery()

if (isLoading) return <SkeletonLoader />
if (isError)   return <ErrorMessage />
return <StatCards data={stats} />
```

RTK Query auto-provides: `isLoading`, `isError`, `isFetching`, `data`, `refetch` — no manual state management needed.

---

## 7. React Context API — Lightweight Global State

### What is Context?

Context is React's built-in way to share data between components without passing it as props through every level. It's best for data that changes infrequently (current user, theme, notifications).

For complex or frequently changing state, Redux is better. Context is the simpler alternative.

### AuthContext — useReducer Pattern

**File:** `src/features/auth/AuthContext.tsx`

Uses `useReducer` — like a mini Redux inside a single Context. Good for state that has multiple actions.

```typescript
type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':  return { user: action.payload, isAuthenticated: true }
    case 'LOGOUT': return { user: null, isAuthenticated: false }
  }
}
```

A custom hook makes it easy to consume:
```typescript
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
```

Usage anywhere in the app:
```typescript
const { user, isAuthenticated, login, logout } = useAuth()
```

### ThemeContext — localStorage Persistence

**File:** `src/features/auth/ThemeContext.tsx`

```typescript
const [theme, setTheme] = useState<'light' | 'dark'>(() =>
  (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
)

useEffect(() => {
  localStorage.setItem('theme', theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}, [theme])
```

- Reads from `localStorage` on first load so the theme persists across page refreshes
- Toggles the `dark` class on `<html>` — Tailwind's dark mode reads this class

### ToastContext — Notification Queue

**File:** `src/components/organisms/Toast.tsx`

Provides `showToast(message, type)` globally. Components call it without knowing where the toast UI is rendered (it uses a Portal — see section 13).

---

## 8. React Router v7 — Navigation

### What is React Router?

React Router handles navigation between pages in a Single Page App (SPA). Instead of the browser loading a new HTML file on each click, React Router swaps out components — fast and seamless.

### Route Structure

**File:** `src/App.tsx`

```
/login              → LoginPage (public)
/                   → redirects to /dashboard
/dashboard          → DashboardPage  (protected)
/board              → BoardPage      (protected)
/analytics          → AnalyticsPage  (protected)
/analytics/tasks    → TaskListPage   (protected)
/team               → TeamPage       (protected)
/settings           → SettingsPage   (protected)
```

### Nested Routes & Outlet

Routes are nested — the parent renders `<Outlet />` which is replaced by the matched child:

```
<Route element={<ProtectedRoute />}>        ← checks auth
  <Route element={<AppLayout />}>           ← renders sidebar + header
    <Route path="/dashboard" element={<DashboardPage />} />
  </Route>
</Route>
```

`<Outlet />` in `AppLayout` is where `DashboardPage` appears.

### ProtectedRoute

**File:** `src/features/auth/ProtectedRoute.tsx`

```typescript
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
```

If not logged in → redirect to `/login`. Otherwise → render the child route.

### Lazy Loading + Suspense

**File:** `src/App.tsx`

```typescript
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'))
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'))
```

`lazy()` tells Vite to split each page into its own JS file. It's only downloaded when the user first navigates to that page — the initial load is faster.

`<Suspense fallback={<PageLoader />}>` shows a loader while the chunk downloads.

---

## 9. React Hook Form + Zod — Forms & Validation

### The problem with forms

A form with 5 fields needs: current values, touched state, error messages, submit handling, loading state. Managing all that with `useState` gets messy fast.

### React Hook Form (RHF)

RHF manages all form state with minimal re-renders. The key function is `useForm()`.

### Zod — Schema Validation

Zod lets you define validation rules as a schema (a blueprint), then validates against it.

```typescript
const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
```

### Connecting RHF + Zod

**File:** `src/features/auth/LoginPage.tsx`

```typescript
const {
  register,       // connects input to form state
  handleSubmit,   // wraps your onSubmit — runs validation first
  formState: { errors, isSubmitting },
  setError,       // manually set an error (e.g. from server response)
} = useForm({
  resolver: zodResolver(loginSchema), // plug Zod into RHF
})
```

**Registering a field:**
```typescript
<Input {...register('email')} />
```
`register` returns `{ name, ref, onChange, onBlur }` — all the props an input needs.

**Showing errors:**
```typescript
{errors.email && <p>{errors.email.message}</p>}
```

**Server-side errors:**
```typescript
setError('root', { message: 'Invalid credentials' })
```

### Where forms are used

| File | Form purpose |
|------|-------------|
| `features/auth/LoginPage.tsx` | Login with email + password |
| `features/auth/SettingsPage.tsx` | Edit profile, tracks `isDirty` (unsaved changes) |
| `features/board/CreateTaskPage.tsx` | Create new task (title, description, status, priority) |
| `features/board/BoardPage.tsx` | Quick-add task modal |
| `features/team/InviteMemberForm.tsx` | Invite team member by email + role |

---

## 10. Atomic Design — Component Architecture

Atomic Design breaks UI into a hierarchy from smallest to largest. The idea: small pieces combine into bigger ones, like atoms form molecules, molecules form organisms.

### Atoms — `src/components/atoms/`

The smallest, most reusable pieces. No business logic. Stateless.

**Button** (`atoms/Button.tsx`)
- `React.memo` — won't re-render unless props change
- `forwardRef` — parent can access the DOM button element
- Variants: `primary`, `secondary`, `ghost`, `danger`
- `isLoading` prop shows spinner and disables click

**Input** (`atoms/Input.tsx`)
- `forwardRef` — required for React Hook Form to attach its ref
- `error` prop turns the border red
- `aria-invalid` attribute for screen readers

**Badge** (`atoms/Badge.tsx`)
- Purely visual — shows colored labels for task status and priority
- `todo` → grey, `in-progress` → blue, `review` → yellow, `done` → green

**Others:** `Label`, `Select`, `Textarea` — same patterns

### Molecules — `src/components/molecules/`

Combinations of atoms. Slightly more structure, minimal logic.

**FormField** (`molecules/FormField.tsx`)

Composes Label + Input/Select/Textarea + error message + hint text:

```typescript
<FormField
  label="Email"
  required
  as="input"
  error={errors.email?.message}
  hint="We'll never share your email"
  inputProps={{ ...register('email'), type: 'email' }}
/>
```

One `FormField` replaces three separate atoms in every form — keeps forms clean and consistent.

### Organisms — `src/components/organisms/`

Complex components with their own internal state or side effects.

**Modal** — Uses React Portal (see section 13)
**Toast** — Uses React Portal + Context
**ErrorBoundary** — Class component for catching crashes (see section 12)

### Feature Components

Each feature has its own components folder for UI that belongs only to that feature:

- `features/board/components/TaskCard.tsx` — Kanban card
- `features/analytics/AnalyticsCharts.tsx` — Chart collection
- `features/team/InviteMemberForm.tsx` — Invite form

---

## 11. Performance Patterns

### React.memo — Skip unnecessary re-renders

By default, a React component re-renders every time its parent re-renders — even if its own props didn't change.

`React.memo` wraps a component and makes it skip re-rendering if its props are the same.

```typescript
export default React.memo(function Button(props) { ... })
```

Used on: `Button`, `Input`, `Badge`, `TaskCard`, `FormField` — components that appear many times in lists.

### useCallback — Stable function references

When you create a function inside a component, React creates a new function object on every render. If you pass that function as a prop to a memoised child, the child sees a "new" prop and re-renders anyway.

`useCallback` returns the same function reference between renders unless the dependencies change.

**File:** `src/features/board/BoardPage.tsx`

```typescript
const handleDragStart = useCallback((taskId: string) => {
  setDraggingId(taskId)
}, []) // No deps = same function forever

const handleDrop = useCallback(
  (status: Task['status']) => {
    dispatch(moveTask({ taskId: draggingId, newStatus: status }))
  },
  [draggingId, dispatch] // Recreate only when these change
)
```

### useMemo — Cache expensive calculations

`useMemo` runs a calculation and remembers the result. It only recalculates when the dependencies change.

**File:** `src/features/dashboard/DashboardPage.tsx`
```typescript
const completionRate = useMemo(() => {
  const total = stats?.find(s => s.label === 'Total Tasks')?.value || 0
  const done  = stats?.find(s => s.label === 'Completed')?.value || 0
  return total > 0 ? Math.round((done / total) * 100) : 0
}, [stats]) // Only recalculate when stats change
```

**File:** `src/features/analytics/TaskListPage.tsx`
```typescript
const filteredTasks = useMemo(() =>
  mockAllTasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === 'all' || t.status === filterStatus)
  ),
  [search, filterStatus]
)
```

### Code Splitting with React.lazy

**File:** `src/App.tsx`

```typescript
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'))
```

Each `lazy()` call creates a separate JS file (chunk). The browser only downloads it when the user navigates there — not on initial load. Smaller initial bundle = faster first paint.

### react-window — Virtual Lists

**File:** `src/features/analytics/TaskListPage.tsx`

The problem: rendering 200 task rows at once = 200 DOM nodes = slow scroll.

The solution: only render the ~10 rows currently visible on screen. As the user scrolls, rows are recycled.

```typescript
<List
  rowCount={filteredTasks.length}
  rowHeight={ROW_HEIGHT}
  rowComponent={TaskRow}
  rowProps={{ tasks: filteredTasks }}
/>
```

Result: always ~10 DOM nodes regardless of how many tasks exist.

---

## 12. Sentry — Error Monitoring

### What is Sentry?

Sentry is a service that captures crashes and errors from your running app — even in production — and shows you the original source code, user context, and a replay of what happened.

### Setup

**File:** `src/services/sentry.ts`

`initSentry()` is called in `main.tsx` BEFORE React renders — so even errors in the very first render are captured.

If `VITE_SENTRY_DSN` is empty, it exits silently (local development default).

### Key configuration

```typescript
Sentry.init({
  dsn: env.VITE_SENTRY_DSN,
  environment: env.VITE_SENTRY_ENVIRONMENT, // 'development' or 'production'
  release: env.VITE_APP_VERSION,             // links errors to a deploy version

  integrations: [
    Sentry.browserTracingIntegration(), // measures page load + API timing
    Sentry.replayIntegration(),         // records session replays
  ],

  tracesSampleRate: 0.2,          // 20% of sessions get performance tracing
  replaysSessionSampleRate: 0.1,  // 10% of sessions get a replay recording
  replaysOnErrorSampleRate: 1.0,  // 100% of error sessions get a replay

  enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_ENABLED === 'true',

  beforeSend(event) {
    // Drop ChunkLoadError — not a real bug, just a stale browser tab
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') return null
    return event
  },
})
```

### Manual usage anywhere in the app

```typescript
import { Sentry } from '@services/sentry'

Sentry.captureException(error)                           // report an exception
Sentry.captureMessage('Something unexpected', 'warning') // report a message
Sentry.setUser({ id: user.id, email: user.email })       // attach user to errors
Sentry.addBreadcrumb({ message: 'User clicked submit' }) // leave a trail
```

### ErrorBoundary

**File:** `src/components/organisms/ErrorBoundary.tsx`

React normally crashes the entire app on an unhandled error. An Error Boundary catches the error, shows a fallback UI, and reports to Sentry.

```typescript
componentDidCatch(error: Error, info: ErrorInfo) {
  Sentry.withScope(scope => {
    scope.setExtra('componentStack', info.componentStack)
    Sentry.captureException(error)
  })
}
```

It's a **class component** — the only place in this project that uses a class. `getDerivedStateFromError` and `componentDidCatch` are only available as class lifecycle methods.

---

## 13. React Portals — Modals & Toasts

### The problem

CSS `overflow: hidden` and `z-index` stacking contexts can trap a modal inside its parent container, clipping it or putting it behind other elements.

### React Portals

`createPortal(children, targetNode)` renders a component's output to a different DOM node — typically `document.body` — while keeping it in the React component tree.

**File:** `src/components/organisms/Modal.tsx`

```typescript
return createPortal(
  <div className="fixed inset-0 z-50 ...">  {/* always full-screen */}
    <div onClick={onClose} />               {/* backdrop */}
    <div onClick={e => e.stopPropagation()}>{/* modal box — click doesn't bubble to backdrop */}
      {children}
    </div>
  </div>,
  document.body  // renders outside the React tree's DOM position
)
```

**Extra UX details in Modal:**
- `Escape` key closes it
- Backdrop click closes it (`stopPropagation` on inner box prevents accidental close)
- `document.body.style.overflow = 'hidden'` prevents background scrolling while open

**File:** `src/components/organisms/Toast.tsx`

Same portal technique — toasts always appear in the bottom-right corner, unaffected by parent CSS.

---

## 14. Tailwind CSS v4 — Styling

### What is Tailwind?

Tailwind is a utility-first CSS framework. Instead of writing custom CSS classes, you apply small pre-built classes directly in your JSX.

```typescript
// Without Tailwind — custom CSS needed
<button className="submit-button">Save</button>

// With Tailwind — no custom CSS file needed
<button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
  Save
</button>
```

### Dark Mode — Class Strategy

Tailwind is configured to use the `dark` class on `<html>` to activate dark styles:

```typescript
// ThemeContext adds/removes this class:
document.documentElement.classList.toggle('dark', theme === 'dark')
```

In components, dark variants are written alongside light ones:
```typescript
className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
```

### cn() — Class Merging Utility

**File:** `src/utils/cn.ts`

```typescript
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

Used in atom components to merge base classes, variant classes, and caller-provided classes without conflicts:

```typescript
// Button.tsx
className={cn(
  'inline-flex items-center rounded-lg font-medium transition-colors', // base
  variantClasses[variant],   // e.g. 'bg-purple-600 hover:bg-purple-700 text-white'
  sizeClasses[size],         // e.g. 'px-4 py-2 text-sm'
  className                  // whatever the caller passes in
)}
```

---

## 15. Recharts — Data Visualisation

**File:** `src/features/analytics/AnalyticsCharts.tsx`

Recharts is a charting library built on React components. Every piece of a chart is a component.

### Charts used

**Bar Chart — Tasks by status**
```typescript
<BarChart data={barData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value" fill="#8b5cf6" />
</BarChart>
```

**Pie Chart — Priority distribution**
```typescript
<PieChart>
  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%">
    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```

**Line Chart — Weekly trend**
**Horizontal Bar Chart — Tasks by tag**

### ResponsiveContainer

All charts are wrapped in:
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart ...>
```

This makes charts resize with the browser window — no fixed pixel widths needed.

### Data transformation with useMemo

Raw task data is transformed into chart-ready format:
```typescript
const barData = useMemo(() => [
  { name: 'Todo',        value: tasks.filter(t => t.status === 'todo').length },
  { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
  // ...
], [tasks])
```

`useMemo` ensures this only recalculates when `tasks` changes.

---

## 16. Data Flow Examples

### Example 1: Creating a Task

```
User fills CreateTaskPage form
  ↓
Zod schema validates (title required, status must be valid enum, etc.)
  ↓
handleSubmit runs onSubmit with validated data
  ↓
dispatch(addTask(data))          ← Redux action
  ↓
boardSlice reducer runs          ← Immer: state.tasks.push(newTask)
  ↓
Redux state updates
  ↓
BoardPage re-renders             ← useAppSelector detects state change
  ↓
useMemo groups tasks by column   ← recalculates columnTasks
  ↓
New TaskCard appears in Kanban
  ↓
showToast('Task created!', 'success')  ← Context API
  ↓
Toast portal renders in bottom-right
```

### Example 2: Moving a Task (Drag & Drop)

```
User drags TaskCard
  ↓
onDragStart → setDraggingId(taskId)    ← local state
  ↓
User drops on a different column
  ↓
onDrop → dispatch(moveTask({ taskId, newStatus }))
  ↓
boardSlice reducer: find task, update status
  ↓
Redux state updates
  ↓
BoardPage re-renders, task appears in new column
  ↓
showToast('Task moved to In Progress', 'info')
```

### Example 3: Dashboard Loading

```
DashboardPage mounts
  ↓
useGetStatsQuery() called          ← RTK Query hook
  ↓
isLoading = true
  ↓
Skeleton loaders render (animate-pulse grey boxes)
  ↓
fakeBaseQuery waits 800ms (simulates network)
  ↓
Returns mock stats data
  ↓
isLoading = false, data = stats
  ↓
Stat cards render with real numbers
  ↓
useMemo calculates completionRate  ← only now that stats exist
  ↓
Progress bar animates to final percentage
```

### Example 4: Changing a Team Member's Role

```
TeamPage: user changes <Select> on a member card
  ↓
handleRoleChange(memberId, newRole) called
  ↓
dispatch(updateMemberRole({ id: memberId, role: newRole }))
  ↓
teamSlice reducer: find member, update role property
  ↓
Redux state updates
  ↓
TeamPage re-renders, badge shows new role
  ↓
showToast('Role updated', 'info')
```

### Example 5: Login Flow

```
User types email + password
  ↓
On each keystroke: Zod validates, errors appear/disappear
  ↓
User submits form
  ↓
handleSubmit runs onSubmit
  ↓
isSubmitting = true → button shows spinner, disabled
  ↓
login(email, password) called (AuthContext)
  ↓
Simulated 600ms delay
  ↓
If credentials match demo user:
  dispatch({ type: 'LOGIN', payload: user })
  navigate('/dashboard')
Else:
  setError('root', { message: 'Invalid credentials' })
  Error displayed below form
```

---

## Quick Reference: Concept → File

| Concept | Key File(s) |
|---------|------------|
| Redux store setup | `src/store/index.ts` |
| Board state (tasks) | `src/features/board/boardSlice.ts` |
| Team state | `src/features/team/teamSlice.ts` |
| RTK Query API | `src/features/dashboard/api.ts` |
| Auth context | `src/features/auth/AuthContext.tsx` |
| Theme context | `src/features/auth/ThemeContext.tsx` |
| Toast context | `src/components/organisms/Toast.tsx` |
| Protected routes | `src/features/auth/ProtectedRoute.tsx` |
| Route definitions | `src/App.tsx` |
| App layout + sidebar | `src/layouts/AppLayout.tsx` |
| Form (login) | `src/features/auth/LoginPage.tsx` |
| Form (create task) | `src/features/board/CreateTaskPage.tsx` |
| Atomic Button | `src/components/atoms/Button.tsx` |
| Atomic Input | `src/components/atoms/Input.tsx` |
| FormField molecule | `src/components/molecules/FormField.tsx` |
| Modal portal | `src/components/organisms/Modal.tsx` |
| Error boundary | `src/components/organisms/ErrorBoundary.tsx` |
| Sentry setup | `src/services/sentry.ts` |
| Charts | `src/features/analytics/AnalyticsCharts.tsx` |
| Virtual list | `src/features/analytics/TaskListPage.tsx` |
| cn() utility | `src/utils/cn.ts` |
| Shared types | `src/types/index.ts` |
| Env var types | `src/env.d.ts` |
| Build config | `vite.config.ts` |
| Environment vars | `.env`, `.env.production`, `.env.example` |
