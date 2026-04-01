import type { ProductDto } from "../types/product";

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
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            {p.brand && <div>{p.brand}</div>}
            {p.category && <div>Category: {p.category.name}</div>}
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
