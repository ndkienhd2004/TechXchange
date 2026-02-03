export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  username: string;
  gender: string;
  phone: string;
  avatar?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignUpRequest {
  id: string;
  email: string;
  password: string;
  username: string;
  gender: string;
  phone: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
