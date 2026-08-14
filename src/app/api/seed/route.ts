import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      ...result,
      success: true,
      message: "Database seeded successfully. Default admin: admin / Admin@12345",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Seed failed" },
      { status: 500 }
    );
  }
}
