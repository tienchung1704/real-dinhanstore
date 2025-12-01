import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Order, OrderStatus } from "@/lib/db/entities/Order";

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);

    const order = await orderRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["items"],
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// UPDATE order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);
    const body = await request.json();

    const order = await orderRepo.findOne({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow updating certain fields
    if (body.status) {
      const validStatuses: OrderStatus[] = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      order.status = body.status;
    }

    if (body.note !== undefined) {
      order.note = body.note;
    }

    await orderRepo.save(order);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE order (soft delete by cancelling)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);

    const order = await orderRepo.findOne({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow cancelling pending orders
    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Can only cancel pending orders" },
        { status: 400 }
      );
    }

    order.status = "cancelled";
    await orderRepo.save(order);

    return NextResponse.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
