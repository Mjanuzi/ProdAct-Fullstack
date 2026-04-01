import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ProductResults } from "../components/ProductResults";
import { useProductSearch } from "../hooks/useProductSearch";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, message, loading, error } = useProductSearch(query);

  return (
    <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      <h1>Find product in store</h1>

      <SearchBar value={query} onChange={setQuery} />

      <ProductResults
        results={results}
        loading={loading}
        error={error}
        message={message}
      />
    </div>
  );
}
