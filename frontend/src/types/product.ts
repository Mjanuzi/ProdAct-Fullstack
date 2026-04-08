export interface CategoryDto {
  id: number;
  name: string;
}

export interface ProductDto {
  id: number;
  ean: string;
  name: string;
  brand: string | null;
  description: string | null;
  category: CategoryDto | null;
  imageUrl?: string | null;
}

export interface ProductSearchResponse {
  products: ProductDto[];
  message?: string;
}

export interface ProductLocationDto {
  id: number;
  display: string;
  aisle: string;
  section: string;
  shelfLevel: number;
  position: string | null;
}

export interface ProductDetailResponse {
  id: number;
  ean: string;
  name: string;
  brand: string | null;
  description: string | null;
  category: string | null;
  openFoodFactsId: string | null;
  imageUrl?: string | null;
  locations: ProductLocationDto[];
  createdAt?: string;
  updatedAt: string;
}
