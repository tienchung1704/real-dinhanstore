import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDataSource } from "@/lib/db/data-source";
import { Cart } from "@/lib/db/entities/Cart";
import { CartItem } from "@/lib/db/entities/CartItem";
import { User } from "@/lib/db/entities/User";
import { Product } from "@/lib/db/entities/Product";

// GET user's cart
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const cartRepo = dataSource.getRepository(Cart);

    const user = await userRepo.findOne({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ items: [], discountCode: "", discountPercent: 0 });
    }

    const cart = await cartRepo.findOne({
      where: { userId: user.id },
      relations: ["items", "items.product"],
    });

    if (!cart) {
      return NextResponse.json({ items: [], discountCode: "", discountPercent: 0 });
    }

    // Transform cart items to match frontend format
    const items = cart.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      salePrice: item.product.salePrice ? Number(item.product.salePrice) : undefined,
      image: item.product.images?.[0] || "",
      brand: item.product.brand || "",
      quantity: item.quantity,
      stock: item.product.stock,
    }));

    return NextResponse.json({
      items,
      discountCode: cart.discountCode || "",
      discountPercent: Number(cart.discountPercent) || 0,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST - Save/Update cart
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, discountCode, discountPercent } = body;

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const cartRepo = dataSource.getRepository(Cart);
    const cartItemRepo = dataSource.getRepository(CartItem);
    const productRepo = dataSource.getRepository(Product);

    const user = await userRepo.findOne({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find or create cart
    let cart = await cartRepo.findOne({
      where: { userId: user.id },
      relations: ["items"],
    });

    if (!cart) {
      cart = cartRepo.create({
        userId: user.id,
        discountCode: discountCode || "",
        discountPercent: discountPercent || 0,
      });
      await cartRepo.save(cart);
    } else {
      // Update discount info
      cart.discountCode = discountCode || "";
      cart.discountPercent = discountPercent || 0;
      
      // Remove existing items
      if (cart.items?.length > 0) {
        await cartItemRepo.remove(cart.items);
      }
      await cartRepo.save(cart);
    }

    // Add new items
    if (items && items.length > 0) {
      const cartItems: CartItem[] = [];
      
      for (const item of items) {
        const product = await productRepo.findOne({ where: { id: item.id } });
        if (product) {
          const cartItem = cartItemRepo.create({
            cartId: cart.id,
            productId: item.id,
            quantity: item.quantity,
          });
          cartItems.push(cartItem);
        }
      }
      
      if (cartItems.length > 0) {
        await cartItemRepo.save(cartItems);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}

// DELETE - Clear cart
export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const cartRepo = dataSource.getRepository(Cart);

    const user = await userRepo.findOne({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const cart = await cartRepo.findOne({ where: { userId: user.id } });
    if (cart) {
      await cartRepo.remove(cart);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
