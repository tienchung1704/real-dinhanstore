import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDataSource } from "@/lib/db/data-source";
import { Order } from "@/lib/db/entities/Order";
import { User } from "@/lib/db/entities/User";
import { Product } from "@/lib/db/entities/Product";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ products: [] });
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const orderRepo = dataSource.getRepository(Order);
    const productRepo = dataSource.getRepository(Product);

    // Find user
    const user = await userRepo.findOne({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ products: [] });
    }

    // Get user's orders with items
    const orders = await orderRepo.find({
      where: { userId: user.id.toString() },
      relations: ["items"],
      order: { createdAt: "DESC" },
    });

    // Extract unique product IDs from orders
    const productIds = new Set<number>();
    const productPurchaseCount: Record<number, number> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.productId) {
          productIds.add(item.productId);
          productPurchaseCount[item.productId] = (productPurchaseCount[item.productId] || 0) + item.quantity;
        }
      });
    });

    if (productIds.size === 0) {
      return NextResponse.json({ products: [] });
    }

    // Fetch products that still exist
    const products = await productRepo
      .createQueryBuilder("product")
      .where("product.id IN (:...ids)", { ids: Array.from(productIds) })
      .andWhere("product.isActive = :isActive", { isActive: true })
      .getMany();

    // Sort by purchase count (most purchased first)
    const sortedProducts = products
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        images: p.images,
        brand: p.brand,
        category: p.category,
        purchaseCount: productPurchaseCount[p.id] || 0,
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 10); // Limit to 10 products

    return NextResponse.json({ products: sortedProducts });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    return NextResponse.json({ products: [] });
  }
}
