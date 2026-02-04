export type StoreRequestStatus = "pending" | "approved" | "rejected";

export interface StoreRequestAdmin {
  id: number;
  username: string;
}

export interface StoreRequestStore {
  id: number;
  name: string;
  rating?: number;
}

export interface StoreRequest {
  id: number;
  user_id: number;
  store_id?: number | null;
  store_name: string;
  store_description?: string | null;
  status: StoreRequestStatus;
  admin_id?: number | null;
  admin_note?: string | null;
  admin?: StoreRequestAdmin | null;
  store?: StoreRequestStore | null;
  created_at?: string;
  updated_at?: string;
}

export interface StoreRequestList {
  total: number;
  requests: StoreRequest[];
  page: number;
  totalPages: number;
}

export interface StoreRequestState {
  items: StoreRequest[];
  total: number;
  page: number;
  totalPages: number;
  listLoading: boolean;
  submitLoading: boolean;
  error: string | null;
}
