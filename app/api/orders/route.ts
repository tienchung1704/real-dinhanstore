import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Order } from "@/lib/db/entities/Order";
import { OrderItem } from "@/lib/db/entities/OrderItem";
import { Product } from "@/lib/db/entities/Product";

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD${year}${month}${day}${random}`;
}

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    let query = orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .orderBy("order.createdAt", "DESC");

    if (status && status !== "all") {
      query = query.where("order.status = :status", { status });
    }
    if (userId) {
      query = query.andWhere("order.userId = :userId", { userId });
    }

    const total = await query.getCount();
    const orders = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// CREATE new order
export async function POST(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);
    const productRepo = dataSource.getRepository(Product);
    const body = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      note,
      userId,
      items,
      // New fields from cart
      total: cartTotal,
      discount,
      discountCode,
      addressId,
      paymentStatus,
    } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    // Calculate totals and create order items
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      // Support both formats: { productId, quantity } or { id, quantity, name, price, salePrice }
      const productId = item.productId || item.id;
      const product = await productRepo.findOne({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = item.salePrice || item.price || product.salePrice || product.price;
      const itemTotal = Number(price) * item.quantity;
      subtotal += itemTotal;

      const orderItem = new OrderItem();
      orderItem.productId = product.id;
      orderItem.productName = item.name || product.name;
      orderItem.price = Number(price);
      orderItem.quantity = item.quantity;
      orderItem.total = itemTotal;
      // Store product snapshot for order history
      orderItem.productSnapshot = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : undefined,
        brand: product.brand,
        image: product.images?.[0],
      };
      orderItems.push(orderItem);

      // Update stock
      product.stock -= item.quantity;
      await productRepo.save(product);
    }

    const shippingFee = subtotal >= 500000 ? 0 : 30000; // Free shipping over 500k
    const discountAmount = discount ? (subtotal * discount) / 100 : 0;
    const total = cartTotal || (subtotal - discountAmount + shippingFee);

    const order = orderRepo.create({
      orderNumber: generateOrderNumber(),
      customerName: customerName || "Khách hàng",
      customerEmail: customerEmail || "",
      customerPhone: customerPhone || "",
      shippingAddress: shippingAddress || "",
      subtotal,
      shippingFee,
      discount: discountAmount,
      total,
      paymentMethod: paymentMethod || "cod",
      note: note || (discountCode ? `Mã giảm giá: ${discountCode}` : ""),
      userId,
      items: orderItems,
      status: paymentStatus === "pending" ? "pending" : "processing",
    });

    await orderRepo.save(order);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
