type HttpMethod = "GET" | "POST" | "PATCH";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  authToken?: string;
}

export async function requestJson<T>(
  input: string,
  init?: RequestOptions,
): Promise<T> {
  const { authToken, ...requestInit } = init ?? {};
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(input, {
    cache: "no-store",
    headers,
    ...requestInit,
  });

  if (!response.ok) {
    const message = (await response.text()) || `Request failed with status ${response.status}`;
    throw new HttpError(response.status, message);
  }

  return (await response.json()) as T;
}
