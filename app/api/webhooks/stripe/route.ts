import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDataSource } from "@/lib/db/data-source";
import { Order } from "@/lib/db/entities/Order";
import { User } from "@/lib/db/entities/User";
import { Product } from "@/lib/db/entities/Product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);
    const userRepo = dataSource.getRepository(User);
    const productRepo = dataSource.getRepository(Product);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const clerkId = session.metadata?.clerkId;

      if (orderId) {
        // Update order status
        const order = await orderRepo.findOne({
          where: { id: parseInt(orderId) },
          relations: ["items"],
        });

        if (order) {
          order.paymentStatus = "paid";
          order.status = "processing";
          order.stripeSessionId = session.id;
          await orderRepo.save(order);

          // Update product stock
          for (const item of order.items) {
            if (item.productId) {
              const product = await productRepo.findOne({ where: { id: item.productId } });
              if (product) {
                product.stock = Math.max(0, product.stock - item.quantity);
                await productRepo.save(product);
              }
            }
          }

          // Get points used from session metadata
          const pointsUsed = parseInt(session.metadata?.pointsUsed || "0");

          // Update user points: subtract used points, add earned points (15% of total)
          if (clerkId) {
            const user = await userRepo.findOne({ where: { clerkId } });
            if (user) {
              const pointsToAdd = Math.round(Number(order.total) * 0.15);
              const currentPoints = Number(user.points || 0);
              user.points = Math.max(0, currentPoints - pointsUsed + pointsToAdd);
              await userRepo.save(user);
              console.log(`User ${user.email}: -${pointsUsed} used, +${pointsToAdd} earned = ${user.points} total`);
            }
          }

          console.log(`Order ${order.orderNumber} payment completed`);
        }
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await orderRepo.findOne({ where: { id: parseInt(orderId) } });
        if (order && order.paymentStatus === "pending") {
          order.paymentStatus = "failed";
          order.status = "cancelled";
          await orderRepo.save(order);
          console.log(`Order ${order.orderNumber} payment failed/expired`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
