# Redux Store

- **axiosConfig.ts** — Axios cho toàn hệ thống: baseURL, token, 401 → refresh-token hoặc logout. Gọi `createAxiosInstance(store)` trong `makeStore`.
- **State** — Quản lý riêng ở từng slice (authSlice, userSlice, ...). API gọi qua `getAxiosInstance()` trong authApi, userApi, ...

## Cấu trúc

```
store/
├── index.ts         # makeStore, createAxiosInstance(store), AppStore, RootState
├── axiosConfig.ts   # createAxiosInstance, getAxiosInstance (token, refresh, 401)
├── hooks.ts         # useAppDispatch, useAppSelector, useAppStore
├── rootReducer.ts   # combineReducers (auth, user, ...)
└── middleware.ts    # (optional)
```

## Trong component

```tsx
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SignIn } from "@/features/auth/store/authSlice";
import {
  selectLoading,
  selectError,
} from "@/features/auth/store/authSelectors";

function LoginForm() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const handleSubmit = async (credentials) => {
    const result = await dispatch(SignIn(credentials));
    if (SignIn.fulfilled.match(result)) {
      // redirect...
    }
  };
}
```

## Thêm API mới

1. Dùng `getAxiosInstance()` từ `@/store/axiosConfig` trong service (authApi, userApi, ...).
2. State (loading, error, data) quản lý trong slice của feature (thunks + extraReducers).
