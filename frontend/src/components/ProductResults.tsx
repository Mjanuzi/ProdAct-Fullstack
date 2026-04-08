import type { ProductDto } from "../types/product";
import { Link } from "react-router-dom";
type Props = {
  results: ProductDto[];
  loading: boolean;
  error: string | null;
  message: string | null;
};
export function ProductResults({ results, loading, error, message }: Props) {
  if (loading) return <p style={{ color: "#fff" }}>Searching...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (message && results.length === 0) {
    return <p style={{ color: "#fff" }}>{message}</p>;
  }
  if (results.length > 0) {
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {results.map((p) => (
          <li
            key={p.id}
            style={{
              padding: 12,
              border: "1px solid rgba(255, 255, 255, 0.7)",
              borderRadius: 14,
              marginBottom: 12,
              background: "rgba(30, 30, 30, 0.72)",
              backdropFilter: "blur(2px)",
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
              <div style={{ color: "#fff" }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                {p.brand ? <div style={{ opacity: 0.9 }}>{p.brand}</div> : null}
                {p.category ? (
                  <div style={{ opacity: 0.95 }}>Category: {p.category.name}</div>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  }
  return null;
}
