export interface Shop {
  info: ShopInfo | null;
  products: Product[];
  productsTotal: number;
  productsTotalPages: number;
  productRequests: ShopProductRequest[];
  productRequestsTotal: number;
  productRequestsTotalPages: number;
  catalogSpecRequests: ShopCatalogSpecRequest[];
  catalogSpecRequestsTotal: number;
  catalogSpecRequestsTotalPages: number;
  brands: ProductBrand[];
  loading: boolean;
  requestsLoading: boolean;
  error: string | null;
  productCatalogs: ProductCatalog[];
  productCatalogsTotalPages: number;
}

export interface ProductBrand {
  id: string;
  name: string;
  image: string | null;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  brand_id: string;
  category_id: string;
  description: string | null;
  specs: Record<string, string>;
  default_image: string;
  msrp: string;
  price?: string | number;
  status: string;
  created_at: string;
  updated_at: string;
  brand: ProductBrand;
  category: ProductCategory;
  buyturn: number;
  quantity: number;
}

export interface ShopProductRequest {
  id: string;
  name: string;
  status: string;
  created_at: string;
  category?: { id: string; name: string };
  catalog?: { id: string; name: string };
}

export interface ShopCatalogSpecRequest {
  id: string;
  catalog_id: string;
  spec_key: string;
  proposed_values: string[];
  status: string;
  created_at: string;
  catalog?: { id: string; name: string };
}

export interface ShopInfo {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
  logo?: string;
  banner?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  address_line?: string | null;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  ghn_province_id?: number | null;
  ghn_district_id?: number | null;
  ghn_ward_code?: string | null;
  owner: {
    id: string;
    username: string;
    email: string;
  };
}

export interface ProductCatalog {
  id: string;
  name: string;
  brand_id: string;
  category_id: string;
  description: string | null;
  specs: Record<string, string>;
  default_image: string;
  msrp: string;
  status: string;
  created_at: string;
  updated_at: string;
  brand: ProductBrand;
  category: ProductCategory;
}
