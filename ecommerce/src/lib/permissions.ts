// FILE: src/lib/permissions.ts

import type { UserRole } from "@/lib/auth";

export function canAccessCustomerPanel(
  role: UserRole
) {
  return (
    role === "USER" ||
    role === "ADMIN" ||
    role === "DEVELOPER"
  );
}

export function canAccessAdminPanel(
  role: UserRole
) {
  return (
    role === "ADMIN" ||
    role === "DEVELOPER"
  );
}

export function canAccessDeveloperPanel(
  role: UserRole
) {
  return role === "DEVELOPER";
}

export function isPrivilegedRole(
  role: UserRole
) {
  return (
    role === "ADMIN" ||
    role === "DEVELOPER"
  );
}