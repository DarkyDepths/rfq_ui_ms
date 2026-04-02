import { appConfig } from "@/config/app";
import type { AppRole } from "@/models/ui/role";

const STORAGE_KEY = "rfq-ui-ms-role";

const defaultTeamByRole: Record<AppRole, string> = {
  executive: "Executive",
  manager: "Estimation",
  estimator: "Estimation",
};

const defaultNameByRole: Record<AppRole, string> = {
  executive: "Executive Viewer",
  manager: "RFQ Manager",
  estimator: "Estimator",
};

export interface ManagerActorOptions {
  permissions?: string[];
  team?: string;
  userId?: string;
  userName?: string;
}

function isRole(value: string | null): value is AppRole {
  return value === "executive" || value === "manager" || value === "estimator";
}

export function getCurrentAppRole(): AppRole {
  if (typeof window === "undefined") {
    return appConfig.defaultRole;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isRole(stored) ? stored : appConfig.defaultRole;
}

export function buildManagerActorHeaders(
  options?: ManagerActorOptions,
): HeadersInit {
  const role = getCurrentAppRole();
  const permissions = options?.permissions?.length
    ? options.permissions.join(",")
    : "*";

  return {
    "X-Debug-User-Id": options?.userId ?? `rfq-ui-${role}`,
    "X-Debug-User-Name": options?.userName ?? defaultNameByRole[role],
    "X-Debug-User-Team": options?.team ?? defaultTeamByRole[role],
    "X-Debug-Permissions": permissions,
  };
}
