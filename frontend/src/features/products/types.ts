export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: string | number;
  compareAtPrice?: string | number;
  rating: number;
  reviewCount?: number;
  badgeText?: string;
  category_id: number;
  seller_id: number;
  store_id: number;
  brand_id?: number;
  catalog_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
  default_image?: string;
  images?: { id: number; url: string; sort_order: number }[];
  brand?: { id: string; name: string; image: string | null };
  category?: { id: string; name: string };
  store?: { id: string; name: string; rating: number };
  attributes?: { id: number; attr_key: string; attr_value: string }[];
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}
