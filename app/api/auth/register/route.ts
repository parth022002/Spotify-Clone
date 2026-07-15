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
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        id: userId,
        email,
        password: hashedPassword,
        full_name: fullName,
      },
    });

    const token = signSession(userId);

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
    console.error("[REGISTER_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
