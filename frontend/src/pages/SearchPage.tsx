import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ProductResults } from "../components/ProductResults";
import { useProductSearch } from "../hooks/useProductSearch";
import styles from "../styles/SearchPage.module.css";
import { Link } from "react-router-dom";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, message, loading, error } = useProductSearch(query);
  const backgroundImageUrl = "/fruktdisk-i-en-matbutik.jpg";

  return (
    <div className={styles.page}>
      <div
        aria-hidden
        className={styles.background}
        style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
      />
      <div aria-hidden className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.topActions}>
          <Link to="/admin" className={styles.adminLink}>
            Admin
          </Link>
        </div>
        <h1 className={styles.title}>Search product</h1>

        <SearchBar value={query} onChange={setQuery} />

        <ProductResults
          results={results}
          loading={loading}
          error={error}
          message={message}
        />
      </div>
    </div>
  );
}
