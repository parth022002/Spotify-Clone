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

    const subscription = await db.subscription.findFirst({
      where: {
        user_id: userId,
        status: {
          in: ["trialing", "active"],
        },
      },
      include: {
        price: {
          include: {
            product: true,
          },
        },
      },
    });

    // Rename fields if necessary to match client-side expectation
    // Client-side expects: { ..., prices: { ..., products: { ... } } }
    // Let's format the response to match the exact shape expected:
    if (subscription) {
      const formattedSubscription = {
        ...subscription,
        prices: subscription.price ? {
          ...subscription.price,
          products: subscription.price.product
        } : null
      };
      return NextResponse.json(formattedSubscription);
    }

    return NextResponse.json(null);
  } catch (error: any) {
    console.error("[USER_SUBSCRIPTION_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
