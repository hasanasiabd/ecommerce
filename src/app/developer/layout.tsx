// FILE: src/app/developer/layout.tsx

import type { ReactNode } from "react";

import { getSession } from "@/lib/auth";
import {
  getAdminPanelPath,
  getDeveloperPanelPath,
} from "@/lib/env";
import { DeveloperPanelShell } from "./developer-panel-shell";

export default async function DeveloperLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getSession();

  // The developer login screen should remain a focused authentication page.
  if (!session || session.role !== "DEVELOPER") {
    return children;
  }

  return (
    <DeveloperPanelShell
      developerPath={getDeveloperPanelPath()}
      adminPath={getAdminPanelPath()}
    >
      {children}
    </DeveloperPanelShell>
  );
}
