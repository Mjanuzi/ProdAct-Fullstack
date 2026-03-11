const API_BASE_URL = "http://localhost:3001";

//instead of coding fetch("http://localhost:3001/api/products?q=... everywhere, Im making a base url witch is easier for testing and changes
export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`Request failed with statis ${res.status}`);
  }
  return res.json() as Promise<T>;
}
