import { useEffect, useState } from "react";
import { searchProducts } from "../api/products";
import type { ProductDto } from "../types/product";

const DEBOUNCE_MS = 300;

export function useProductSearch(query: string) {
    const trimmed = query.trim();

    const [result, setResult] = useState<ProductDto[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
}
