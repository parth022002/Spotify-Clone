import { NextResponse } from "next/server";
import { db } from "@/libs/db";

export async function POST(request: Request) {
  try {
    const { id, full_name, avatar_url } = await request.json();

    if (!id) {
      return new NextResponse("Missing user ID", { status: 400 });
    }

    const user = await db.user.upsert({
      where: { id },
      update: {
        full_name,
        avatar_url,
      },
      create: {
        id,
        full_name,
        avatar_url,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[USER_SYNC_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
