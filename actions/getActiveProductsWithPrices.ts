import { db } from "@/libs/db";
import { ProductWithPrice } from "@/types";

const getActiveProductsWithPrices = async (): Promise<ProductWithPrice[]> => {
  try {
    const products = await db.product.findMany({
      where: {
        active: true,
      },
      include: {
        prices: {
          where: {
            active: true,
          },
          orderBy: {
            unit_amount: 'asc',
          },
        },
      },
    });

    // Sort products by metadata->index if available
    const sortedProducts = products.sort((a, b) => {
      const aIndex = (a.metadata as any)?.index || 0;
      const bIndex = (b.metadata as any)?.index || 0;
      return aIndex - bIndex;
    });

    // Cast properties to match internal ProductWithPrice type
    return sortedProducts.map(product => ({
      id: product.id,
      active: product.active ?? undefined,
      name: product.name ?? undefined,
      description: product.description ?? undefined,
      image: product.image ?? undefined,
      metadata: (product.metadata as any) ?? undefined,
      prices: product.prices.map(price => ({
        id: price.id,
        product_id: price.product_id ?? undefined,
        active: price.active ?? undefined,
        description: price.description ?? undefined,
        unit_amount: price.unit_amount ?? undefined,
        currency: price.currency ?? undefined,
        type: (price.type as any) ?? undefined,
        interval: (price.interval as any) ?? undefined,
        interval_count: price.interval_count ?? undefined,
        trial_period_days: price.trial_period_days ?? null,
        metadata: (price.metadata as any) ?? undefined,
      })),
    }));
  } catch (error) {
    console.error("Error in getActiveProductsWithPrices:", error);
    return [];
  }
};

export default getActiveProductsWithPrices;
