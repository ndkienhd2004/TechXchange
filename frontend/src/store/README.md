# Redux Store Structure

This directory contains the Redux store configuration following Redux Toolkit best practices.

## Structure

```
store/
├── index.ts              # Store configuration, RootState, AppDispatch types
├── hooks.ts              # Typed hooks: useAppDispatch, useAppSelector, useAppStore
├── rootReducer.ts         # Combined reducers
├── middleware.ts          # Custom middleware (optional)
└── rtkQuery/
    ├── baseApi.ts         # RTK Query base API configuration
    └── endpoints.ts       # Shared endpoints (optional)
```

## Usage

### In Components

```tsx
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/features/auth";

function MyComponent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  // Use dispatch and selectors...
}
```

### Using RTK Query

```tsx
import { useLoginMutation } from "@/features/auth";

function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  
  const handleSubmit = async (credentials) => {
    try {
      const result = await login(credentials).unwrap();
      // Handle success
    } catch (err) {
      // Handle error
    }
  };
}
```

## Adding New Features

1. Create feature folder in `src/features/[featureName]/`
2. Add slice in `store/[featureName]Slice.ts`
3. Add to `rootReducer.ts`
4. Create API endpoints in `services/[featureName]Api.ts` if needed
5. Export from feature `index.ts`
