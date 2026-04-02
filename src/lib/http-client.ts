type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

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
  const { authToken, headers: rawHeaders, ...requestInit } = init ?? {};
  const headers = new Headers(rawHeaders ?? {});

  if (
    requestInit.body !== undefined &&
    !headers.has("Content-Type") &&
    !(requestInit.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(input, {
    cache: "no-store",
    ...requestInit,
    headers,
  });

  if (!response.ok) {
    const message = (await response.text()) || `Request failed with status ${response.status}`;
    throw new HttpError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
