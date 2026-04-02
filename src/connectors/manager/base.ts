import { apiConfig } from "@/config/api";
import { requestJson, type RequestOptions } from "@/lib/http-client";

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

function buildManagerUrl(
  path: string,
  query?: Record<string, QueryValue>,
) {
  const url = new URL(`${apiConfig.managerApiPath}${path}`, apiConfig.managerBaseUrl);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (Array.isArray(value)) {
        value.forEach((entry) => {
          url.searchParams.append(key, String(entry));
        });
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export function requestManagerJson<T>(
  path: string,
  init?: RequestOptions,
  query?: Record<string, QueryValue>,
) {
  return requestJson<T>(buildManagerUrl(path, query), {
    ...init,
    authToken: init?.authToken ?? apiConfig.managerAuthToken,
  });
}
