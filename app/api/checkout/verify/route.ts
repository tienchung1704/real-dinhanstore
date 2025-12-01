import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { getDataSource } from "@/lib/db/data-source";
import { Order } from "@/lib/db/entities/Order";
import { User } from "@/lib/db/entities/User";
import { Product } from "@/lib/db/entities/Product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, orderId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);
    const userRepo = dataSource.getRepository(User);
    const productRepo = dataSource.getRepository(Product);

    // Find order
    let order;
    if (orderId) {
      order = await orderRepo.findOne({
        where: { id: parseInt(orderId) },
        relations: ["items"],
      });
    } else if (session.metadata?.orderId) {
      order = await orderRepo.findOne({
        where: { id: parseInt(session.metadata.orderId) },
        relations: ["items"],
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if already processed
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Update order
    order.paymentStatus = "paid";
    order.status = "processing";
    order.stripeSessionId = sessionId;
    await orderRepo.save(order);

    // Update product stock
    for (const item of order.items) {
      const product = await productRepo.findOne({ where: { id: item.productId } });
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await productRepo.save(product);
      }
    }

    // Get points used from session metadata
    const pointsUsed = parseInt(session.metadata?.pointsUsed || "0");

    // Update user points: subtract used points, add earned points (15% of total)
    const user = await userRepo.findOne({ where: { clerkId } });
    if (user) {
      const pointsToAdd = Math.round(Number(order.total) * 0.15);
      const currentPoints = Number(user.points || 0);
      // Subtract used points, add earned points
      user.points = Math.max(0, currentPoints - pointsUsed + pointsToAdd);
      await userRepo.save(user);

      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        pointsUsed,
        pointsAdded: pointsToAdd,
        totalPoints: user.points,
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
