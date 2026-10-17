import { NextResponse } from "next/server";
import { verifySession, AdminRole } from "./auth";

const ROLE_WEIGHT: Record<AdminRole, number> = {
  admin: 100,
  seo_manager: 80,
  seo_editor: 50,
  editor: 50,
};

export async function requireAuth(minRole: AdminRole = "editor") {
  const session = await verifySession();
  if (!session) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  const userWeight = ROLE_WEIGHT[session.role] ?? 50;
  const requiredWeight = ROLE_WEIGHT[minRole] ?? 50;

  if (userWeight < requiredWeight) {
    return {
      response: NextResponse.json(
        { error: `Forbidden - requires ${minRole} or higher privileges` },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { response: null, session };
}

