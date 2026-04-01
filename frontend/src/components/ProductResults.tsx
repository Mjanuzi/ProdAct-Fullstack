import type { ProductDto } from "../types/product";
import { Link } from "react-router-dom";

type Props = {
  results: ProductDto[];
  loading: boolean;
  error: string | null;
  message: string | null;
};

export function ProductResults({ results, loading, error, message }: Props) {
  if (loading) return <p>Searching...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;

  if (message && results.length === 0) {
    return <p>{message}</p>;
  }

  if (results.length > 0) {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {results.map((p) => (
          <li key={p.id}>
            <Link
              to={`/products/${p.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              ...
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
