export interface CategoryDto {
    id: number;
    name: string;
}

export interface ProductDto{
id: number;
ean: string;
name: string;
brand: string | null;
description: string | null;
category: CategoryDto | null;
}

export interface ProductSearchResponse {
    products: ProductDto[];
    message?: string;
}