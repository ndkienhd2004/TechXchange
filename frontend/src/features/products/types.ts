export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: string | number;
  compareAtPrice?: string | number;
  rating: number;
  reviewCount?: number;
  review_count?: number;
  buyturn?: number;
  quantity?: number;
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
  catalog?: {
    id?: string | number;
    name?: string;
    specs?: Record<string, unknown>;
  };
  primary_serial_specs?: Record<string, string>;
  spec_options?: { key: string; values: { value: string; quantity: number }[] }[];
  variant_inventory?: {
    serial_id?: number;
    serial_code?: string;
    variant_label?: string;
    attributes: Record<string, string>;
    quantity: number;
    min_price: number;
    max_price: number;
    listing_ids: number[];
  }[];
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
