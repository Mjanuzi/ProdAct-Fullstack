const API_BASE_URL = "http://localhost:3001";

// Instead of writing fetch("http://localhost:3001/api/products?q=...") everywhere,
// this base URL makes testing and future changes easier.
export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}
