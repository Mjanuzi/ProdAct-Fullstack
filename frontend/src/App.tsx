import { SearchPage } from "./pages/SearchPage";
import { Routes, Route } from "react-router-dom";
import { ProductDetailPage } from "./pages/ProductDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
    </Routes>
  );
}

export default App;
