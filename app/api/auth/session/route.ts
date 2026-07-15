import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/libs/db";
import { verifySession } from "@/libs/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("spotify_session")?.value;

    if (!token) {
      return NextResponse.json(null);
    }

    const userId = verifySession(token);

    if (!userId) {
      return NextResponse.json(null);
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        avatar_url: true,
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[SESSION_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
