import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../api/products";
import type { ProductDetailResponse } from "../types/product";
import styles from "../styles/ProductDetailPage.module.css";

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
    return <p className={styles.error}>Invalid product id.</p>;
  }

  if (loading) return <p>Loading product...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>
        ← Back
      </Link>

      <h1>{product.name}</h1>

      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className={styles.image} />
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
        <ul className={styles.placementList}>
          {product.locations.map((loc) => (
            <li key={loc.id} className={styles.placementCard}>
              <div className={styles.placementLine}>
                <strong>Sektion:</strong> {loc.section}
              </div>
              <div className={styles.placementLine}>
                <strong>Gång:</strong> {loc.aisle}
              </div>
              <div className={styles.placementLine}>
                <strong>Hylla:</strong> {loc.shelfLevel}
              </div>
              {loc.position ? (
                <div className={styles.placementLine}>
                  <strong>Position:</strong> {loc.position}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
