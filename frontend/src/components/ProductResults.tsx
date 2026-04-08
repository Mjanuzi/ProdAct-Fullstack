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
          <li
            key={p.id}
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Link
              to={`/products/${p.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    flexShrink: 0,
                    borderRadius: 8,
                  }}
                />
              ) : null}
              <div>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                {p.brand ? <div>{p.brand}</div> : null}
                {p.category ? <div>Category: {p.category.name}</div> : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return null;
}
