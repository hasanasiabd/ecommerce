// FILE: src/lib/env.ts

function requireEnv(
  name: string
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is not configured in the environment.`
    );
  }

  return value;
}

export function getAdminPanelPath() {
  return normalizePath(
    requireEnv("ADMIN_PANEL_PATH")
  );
}

export function getDeveloperPanelPath() {
  return normalizePath(
    requireEnv("DEVELOPER_PANEL_PATH")
  );
}

function normalizePath(
  value: string
) {
  return value.startsWith("/")
    ? value
    : `/${value}`;
}