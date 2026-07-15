import { NextResponse } from "next/server";
import { db } from "@/libs/db";
import { signSession } from "@/libs/session";
import crypto from "crypto";

export const dynamic = "force-dynamic";

async function hashPassword(password: string): Promise<string> {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    const hashedPassword = await hashPassword(password);

    if (hashedPassword !== user.password) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    const token = signSession(user.id);

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    });

    // Set signed cookie
    response.cookies.set("spotify_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("[LOGIN_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
