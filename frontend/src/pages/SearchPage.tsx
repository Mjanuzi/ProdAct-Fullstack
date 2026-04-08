import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ProductResults } from "../components/ProductResults";
import { useProductSearch } from "../hooks/useProductSearch";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, message, loading, error } = useProductSearch(query);
  const backgroundImageUrl = "/fruktdisk-i-en-matbutik.jpg";

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        padding: 16,
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${backgroundImageUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(35%) brightness(0.45)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(55, 55, 55, 0.45)",
        }}
      />

      <div style={{ position: "relative", maxWidth: 520, width: "100%" }}>
        <h1 style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.45)" }}>
          Search product
        </h1>

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
