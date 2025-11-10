export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions<T> {
  method?: HttpMethod;
  body?: T;
  headers?: Record<string, string>;
  auth?: boolean;
}

export async function api<TReq = unknown, TRes = unknown>(
  path: string,
  options: ApiOptions<TReq> = {},
): Promise<TRes> {
  const { method = "GET", body, headers = {}, auth = true } = options;
  const token = auth ? localStorage.getItem("token") : null;
  const base = path.startsWith("/") ? "" : ""; // keep relative by default
  try {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get("content-type");

    if (!res.ok) {
      let errorMessage = `Request failed with ${res.status}`;
      try {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json() as any;
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          errorMessage = await res.text() || errorMessage;
        }
      } catch {
        // If body parsing fails, use default error message
      }
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      return (await res.json()) as TRes;
    }
    return (await res.text()) as TRes;
  } catch (err: any) {
    // Network-level errors (failed to fetch, CORS, DNS)
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("API call failed", { path, method, error: errorMessage, err });
    if (err instanceof TypeError && errorMessage && errorMessage.includes("failed to fetch")) {
      throw new Error("Network error: failed to reach the server. Check your connection or server status.");
    }
    throw err;
  }
}

export function setToken(token: string | null) {
  if (!token) return localStorage.removeItem("token");
  localStorage.setItem("token", token);
}
