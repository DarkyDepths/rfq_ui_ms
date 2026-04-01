type HttpMethod = "GET" | "POST" | "PATCH";

interface RequestOptions extends RequestInit {
  method?: HttpMethod;
}

export async function requestJson<T>(
  input: string,
  init?: RequestOptions,
): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
