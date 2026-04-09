import { del, post, put } from "./client";
import type { ProductDto } from "../types/product";
import { get } from "./client";

type LoginResponse = {
  id: number;
  email: string;
  role: string;
};

export type UpdateProductPayload = {
  name?: string;
  brand?: string;
  description?: string;
  categoryId?: number;
};

export type UpdateLocationsPayload = {
  locations: {
    shelfId?: number;
    aisleName?: string;
    sectionName?: string;
    shelfLabel?: string;
  }[];
};

export type CreateProductPayload = {
  ean: string;
  shelfId?: number;
  aisleName?: string;
  sectionName?: string;
  shelfLabel?: string;
};

export type AisleOption = {
  id: number;
  name: string;
  code: string;
};

export type SectionOption = {
  id: number;
  name: string;
  aisleId: number;
  aisle: AisleOption;
};

export type LayoutOptionsResponse = {
  aisles: AisleOption[];
  sections: SectionOption[];
  shelves: ShelfOption[];
};

export type ShelfOption = {
  id: number;
  name: string;
  sectionId: number;
  level: number;
  position: number | null;
  section: SectionOption;
};

export type CreateSectionPayload = {
  name: string;
  aisleId?: number;
  aisleName?: string;
  aisleCode?: string;
};

export type CreateAislePayload = {
  name: string;
};

export type CreateShelfPayload = {
  name: string;
};

export function login(email: string, password: string): Promise<LoginResponse> {
  return post<LoginResponse>("/api/auth/login", { email, password });
}

export function me(): Promise<LoginResponse> {
  return get<LoginResponse>("/api/auth/me");
}

export function logout(): Promise<void> {
  return post<void>("/api/auth/logout");
}

export function createProduct(payload: CreateProductPayload): Promise<ProductDto> {
  return post<ProductDto>("/api/admin/products", payload);
}

export function getLayoutOptions(): Promise<LayoutOptionsResponse> {
  return get<LayoutOptionsResponse>("/api/admin/layout/options");
}

export function createSection(payload: CreateSectionPayload): Promise<SectionOption> {
  return post<SectionOption>("/api/admin/sections", payload);
}

export function createAisle(payload: CreateAislePayload): Promise<AisleOption> {
  return post<AisleOption>("/api/admin/aisles", payload);
}

export function createShelf(payload: CreateShelfPayload): Promise<void> {
  return post<void>("/api/admin/shelves", payload);
}

export function updateProduct(
  id: number,
  payload: UpdateProductPayload,
): Promise<ProductDto> {
  return put<ProductDto>(`/api/admin/products/${id}`, payload);
}

export function updateProductLocations(
  id: number,
  payload: UpdateLocationsPayload,
): Promise<ProductDto> {
  return put<ProductDto>(`/api/admin/products/${id}/locations`, payload);
}

export function addProductLocation(
  id: number,
  payload: UpdateLocationsPayload["locations"][number],
): Promise<void> {
  return post<void>(`/api/admin/products/${id}/locations`, payload);
}

export function replaceProductLocation(
  productId: number,
  locationId: number,
  payload: UpdateLocationsPayload["locations"][number],
): Promise<void> {
  return put<void>(`/api/admin/products/${productId}/locations/${locationId}`, payload);
}

export function deleteProductLocation(productId: number, locationId: number): Promise<void> {
  return del(`/api/admin/products/${productId}/locations/${locationId}`);
}

export function deleteProduct(id: number): Promise<void> {
  return del(`/api/admin/products/${id}`);
}
