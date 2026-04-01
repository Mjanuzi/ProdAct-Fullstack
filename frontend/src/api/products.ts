import { get } from "./client";
import type { ProductSearchResponse } from "../types/product";
import type { ProductDetailResponse } from "../types/product";

export function searchProducts(query: string): Promise<ProductSearchResponse> {
  const encoded = encodeURIComponent(query);
  return get<ProductSearchResponse>(`/api/products?q=${encoded}`);
}

export async function getProductById(
  id: number,
): Promise<ProductDetailResponse> {
  return get<ProductDetailResponse>(`/api/products/${id}`);
}
