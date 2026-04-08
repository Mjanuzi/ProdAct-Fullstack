import type { ProductDto } from "../types/product";
import { Link } from "react-router-dom";
import styles from "../styles/ProductResults.module.css";

type Props = {
  results: ProductDto[];
  loading: boolean;
  error: string | null;
  message: string | null;
};
export function ProductResults({ results, loading, error, message }: Props) {
  if (loading) return <p className={styles.statusText}>Searching...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;
  if (message && results.length === 0) {
    return <p className={styles.statusText}>{message}</p>;
  }
  if (results.length > 0) {
    return (
      <ul className={styles.list}>
        {results.map((p) => (
          <li key={p.id} className={styles.item}>
            <Link to={`/products/${p.id}`} className={styles.link}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className={styles.image} />
              ) : null}
              <div className={styles.content}>
                <div className={styles.name}>{p.name}</div>
                {p.brand ? <div className={styles.brand}>{p.brand}</div> : null}
                {p.category ? (
                  <div className={styles.category}>Category: {p.category.name}</div>
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
