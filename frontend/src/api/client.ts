const API_BASE_URL = "http://localhost:3001";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errorBody = (await res.json()) as { error?: string };
      if (errorBody?.error) {
        message = errorBody.error;
      }
    } catch {
      // Ignore invalid/non-json error responses.
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, "GET");
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, "POST", body);
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, "PUT", body);
}

export function del(path: string): Promise<void> {
  return request<void>(path, "DELETE");
}
