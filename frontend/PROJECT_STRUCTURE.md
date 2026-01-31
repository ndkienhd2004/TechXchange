# Project Structure

This project follows Redux Toolkit + RTK Query best practices with feature-based architecture.

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with Providers
│   ├── providers.tsx       # Redux Provider (client component)
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── (public)/           # Public routes (optional)
│   └── (auth)/             # Auth routes (optional)
│   └── (dashboard)/        # Dashboard routes (optional)
│
├── store/                  # Redux store configuration
│   ├── index.ts            # makeStore, RootState, AppDispatch
│   ├── hooks.ts            # useAppDispatch, useAppSelector, useAppStore
│   ├── rootReducer.ts      # combineReducers
│   ├── middleware.ts       # Custom middleware (optional)
│   └── rtkQuery/
│       ├── baseApi.ts      # createApi base (fetchBaseQuery, baseUrl, headers)
│       └── endpoints.ts    # Optional: injectEndpoints style
│
├── features/               # Feature-based modules
│   ├── auth/
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │   └── authSelectors.ts
│   │   ├── services/
│   │   │   └── authApi.ts  # RTK Query endpoints
│   │   ├── components/     # Auth-specific components
│   │   ├── types.ts
│   │   └── index.ts        # Public exports
│   │
│   └── user/
│       ├── store/
│       │   ├── userSlice.ts
│       │   └── userSelectors.ts
│       ├── services/
│       │   └── userApi.ts
│       ├── components/     # User-specific components
│       ├── types.ts
│       └── index.ts
│
├── components/             # Shared components
│   ├── commons/           # Common reusable components
│   └── layouts/           # Layout components
│
├── theme/                 # Theme configuration
│   ├── ThemeProvider.tsx
│   ├── dark.ts
│   ├── light.ts
│   └── index.ts
│
└── types/                 # Global TypeScript types
```

## Key Files

### Store Setup

- **`store/index.ts`**: Creates the Redux store with `makeStore()`, exports `RootState` and `AppDispatch` types
- **`store/hooks.ts`**: Typed Redux hooks for use in components
- **`store/rootReducer.ts`**: Combines all feature reducers
- **`store/rtkQuery/baseApi.ts`**: Base RTK Query API with authentication headers

### Feature Structure

Each feature follows this pattern:

```
feature/
├── store/
│   ├── [feature]Slice.ts    # Redux slice with actions & reducers
│   └── [feature]Selectors.ts # Memoized selectors
├── services/
│   └── [feature]Api.ts      # RTK Query endpoints
├── components/              # Feature-specific components
├── types.ts                 # Feature TypeScript types
└── index.ts                 # Public exports
```

## Usage Examples

### Using Redux in Components

```tsx
"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/features/auth";
import { selectIsAuthenticated } from "@/features/auth";

function MyComponent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const handleLogin = () => {
    dispatch(setCredentials({ token: "...", user: {...} }));
  };
  
  return <div>...</div>;
}
```

### Using RTK Query

```tsx
"use client";

import { useLoginMutation, useGetCurrentUserQuery } from "@/features/auth";

function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  const { data: user } = useGetCurrentUserQuery();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      // Success
    } catch (err) {
      // Error handling
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Adding a New Feature

1. Create feature folder: `src/features/[featureName]/`
2. Create slice: `store/[featureName]Slice.ts`
3. Create selectors: `store/[featureName]Selectors.ts`
4. Create API (if needed): `services/[featureName]Api.ts`
5. Add reducer to `store/rootReducer.ts`
6. Export from `features/[featureName]/index.ts`

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Next Steps

- [ ] Add more features (products, orders, etc.)
- [ ] Implement authentication flow
- [ ] Add error handling middleware
- [ ] Add loading states
- [ ] Add optimistic updates
