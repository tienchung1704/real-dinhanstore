import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDataSource } from "@/lib/db/data-source";
import { Order } from "@/lib/db/entities/Order";
import { User } from "@/lib/db/entities/User";
import { sendOrderConfirmationEmail, OrderEmailData } from "@/lib/email/mailer";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);
    const userRepo = dataSource.getRepository(User);

    // Find order
    const order = await orderRepo.findOne({
      where: { id: parseInt(orderId) },
      relations: ["items"],
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if already processed
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Update order status
    order.paymentStatus = "paid";
    order.status = "processing";
    await orderRepo.save(order);

    // Send order confirmation email
    if (order.customerEmail) {
      const emailData: OrderEmailData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        items: order.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total),
        })),
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        discount: Number(order.discount),
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        note: order.note,
        createdAt: order.createdAt,
      };

      sendOrderConfirmationEmail(emailData).catch((err) => {
        console.error("Failed to send order confirmation email:", err);
      });
    }

    // Update user points (15% of total)
    const user = await userRepo.findOne({ where: { clerkId } });
    if (user) {
      const pointsToAdd = Math.round(Number(order.total) * 0.15);
      user.points = Number(user.points || 0) + pointsToAdd;
      await userRepo.save(user);

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        pointsAdded: pointsToAdd,
        totalPoints: user.points,
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("VietQR verify error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
