export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return new NextResponse("Missing user ID", { status: 400 });
    }

    const userDetails = await db.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json(userDetails);
  } catch (error: any) {
    console.error("[USER_DETAILS_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
