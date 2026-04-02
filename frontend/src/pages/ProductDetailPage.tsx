import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../api/products";
import type { ProductDetailResponse } from "../types/product";

export function ProductDetailPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const invalidId = Number.isNaN(numericId);

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    const timer = setTimeout(() => {
      if (cancelled) return;

      setLoading(true);
      setError(null);

      getProductById(numericId)
        .then((data) => {
          if (cancelled) return;
          setProduct(data);
        })
        .catch(() => {
          if (cancelled) return;
          setError("Could not load product details.");
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [numericId, invalidId]);

  if (invalidId) {
    return <p style={{ color: "crimson" }}>Invalid product id.</p>;
  }

  if (loading) return <p>Loading product...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: "0 auto" }}>
      <Link to="/">← Back to search</Link>

      <h1>{product.name}</h1>

      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: "100%",
            maxWidth: 320,
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
      ) : null}

      <p>
        <strong>Brand:</strong> {product.brand ?? "N/A"}
      </p>
      <p>
        <strong>Category:</strong> {product.category ?? "N/A"}
      </p>
      <p>
        <strong>EAN:</strong> {product.ean}
      </p>
      <p>
        <strong>Info:</strong> {product.description ?? "N/A"}
      </p>

      <h2>Placering</h2>
      {product.locations.length === 0 ? (
        <p>No placement registered.</p>
      ) : (
        <ul>
          {product.locations.map((loc) => (
            <li key={loc.id}>{loc.display}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
