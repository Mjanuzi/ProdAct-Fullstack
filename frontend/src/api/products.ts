import { get } from "./client";
import type { ProductSearchResponse } from "../types/product";

export function searchProducts (
query: string,
) : Promise<ProductSearchResponse> {
    const encoded = encodeURIComponent(query);
    return get<ProductSearchResponse>(`/api/products?=${encoded}`)
}
