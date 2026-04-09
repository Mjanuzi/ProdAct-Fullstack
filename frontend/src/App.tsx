import { SearchPage } from "./pages/SearchPage";
import { Routes, Route } from "react-router-dom";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { AdminPage } from "./pages/AdminPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
