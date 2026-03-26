import { useEffect, useState } from "react";
import { searchProducts } from "../api/products";
import type { ProductDto } from "../types/product";

const DEBOUNCE_MS = 300;

export function useProductSearch(query: string) {
  const trimmed = query.trim();

  const [results, setResults] = useState<ProductDto[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    if (!trimmed) {
      setResults([]);
      setMessage(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      searchProducts(trimmed)
        .then((res) => {
          if (cancelled) return;
          setResults(res.products);
          // FK 1.4: tydligt meddelande när inga resultat hittas
          if (res.products.length === 0 && res.message) {
            setMessage(res.message);
          } else {
            setMessage(null);
          }
        })
        .catch((e) => {
          if (cancelled) return;
          console.error(e);
          setError("Ett fel uppstod vid sökning. Försök igen.");
          setResults([]);
          setMessage(null);
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);
  return { results, message, loading, error };
}
