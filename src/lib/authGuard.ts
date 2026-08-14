import { NextResponse } from "next/server";
import { verifySession } from "./auth";

export async function requireAuth(minRole: "admin" | "editor" = "editor") {
  const session = await verifySession();
  if (!session) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  if (minRole === "admin" && session.role !== "admin") {
    return {
      response: NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 }),
      session: null,
    };
  }

  return { response: null, session };
}
