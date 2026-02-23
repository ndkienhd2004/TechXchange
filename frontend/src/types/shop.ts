export interface Shop {
  info: ShopInfo;
  products: Product[];
  productsTotalPages: number;
  brands: ProductBrand[];
  loading: boolean;
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
  status: string;
  created_at: string;
  updated_at: string;
  brand: ProductBrand;
  category: ProductCategory;
  buyturn: number;
  quantity: number;
}

export interface ProductDataResponse {
  data: Product[];
}

export interface ShopInfo {
  name: string;
  description: string;
  logo: string;
  banner: string;
  address: string;
  phone: string;
  email: string;
  website: string;
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
