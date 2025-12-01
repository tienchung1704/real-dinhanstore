import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Order } from "@/lib/db/entities/Order";
import { Between } from "typeorm";

// Helper to get Vietnam timezone date (UTC+7)
function getVietnamDate(date: Date = new Date()): Date {
  const vnOffset = 7 * 60; // Vietnam is UTC+7
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + vnOffset * 60000);
}

// Helper to create date in Vietnam timezone
function createVietnamDate(year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0): Date {
  // Create date string in Vietnam time, then convert to UTC for storage
  const vnDate = new Date(year, month, day, hours, minutes, seconds);
  const vnOffset = 7 * 60; // Vietnam is UTC+7
  return new Date(vnDate.getTime() - vnOffset * 60000);
}

// Format date to YYYY-MM-DD in Vietnam timezone
function formatDateVN(date: Date): string {
  const vnDate = getVietnamDate(date);
  const year = vnDate.getFullYear();
  const month = String(vnDate.getMonth() + 1).padStart(2, "0");
  const day = String(vnDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7days"; // today, yesterday, 3days, 7days, custom, month
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const month = searchParams.get("month"); // Format: YYYY-MM

    const dataSource = await getDataSource();
    const orderRepo = dataSource.getRepository(Order);

    // Get current date in Vietnam timezone
    const nowVN = getVietnamDate();
    const todayYear = nowVN.getFullYear();
    const todayMonth = nowVN.getMonth();
    const todayDay = nowVN.getDate();

    let fromDate: Date;
    let toDate: Date;

    switch (period) {
      case "today":
        fromDate = createVietnamDate(todayYear, todayMonth, todayDay, 0, 0, 0);
        toDate = createVietnamDate(todayYear, todayMonth, todayDay, 23, 59, 59);
        break;
      case "yesterday":
        fromDate = createVietnamDate(todayYear, todayMonth, todayDay - 1, 0, 0, 0);
        toDate = createVietnamDate(todayYear, todayMonth, todayDay - 1, 23, 59, 59);
        break;
      case "3days":
        fromDate = createVietnamDate(todayYear, todayMonth, todayDay - 2, 0, 0, 0);
        toDate = createVietnamDate(todayYear, todayMonth, todayDay, 23, 59, 59);
        break;
      case "7days":
        fromDate = createVietnamDate(todayYear, todayMonth, todayDay - 6, 0, 0, 0);
        toDate = createVietnamDate(todayYear, todayMonth, todayDay, 23, 59, 59);
        break;
      case "custom":
        if (!startDate || !endDate) {
          return NextResponse.json({ error: "startDate and endDate required for custom period" }, { status: 400 });
        }
        const [sYear, sMonth, sDay] = startDate.split("-").map(Number);
        const [eYear, eMonth, eDay] = endDate.split("-").map(Number);
        fromDate = createVietnamDate(sYear, sMonth - 1, sDay, 0, 0, 0);
        toDate = createVietnamDate(eYear, eMonth - 1, eDay, 23, 59, 59);
        break;
      case "month":
        if (!month) {
          return NextResponse.json({ error: "month required (YYYY-MM format)" }, { status: 400 });
        }
        const [year, mon] = month.split("-").map(Number);
        fromDate = createVietnamDate(year, mon - 1, 1, 0, 0, 0);
        // Get last day of month
        const lastDay = new Date(year, mon, 0).getDate();
        toDate = createVietnamDate(year, mon - 1, lastDay, 23, 59, 59);
        break;
      default:
        fromDate = createVietnamDate(todayYear, todayMonth, todayDay - 6, 0, 0, 0);
        toDate = createVietnamDate(todayYear, todayMonth, todayDay, 23, 59, 59);
    }

    // Fetch orders in date range (all orders except cancelled)
    const orders = await orderRepo
      .createQueryBuilder("order")
      .where("order.createdAt BETWEEN :fromDate AND :toDate", { fromDate, toDate })
      .andWhere("order.status != :cancelled", { cancelled: "cancelled" })
      .orderBy("order.createdAt", "ASC")
      .getMany();

    // Group revenue by date (Vietnam timezone)
    const revenueByDate: Record<string, { date: string; revenue: number; orders: number }> = {};

    // Initialize all dates in range (using Vietnam timezone)
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dateKey = formatDateVN(currentDate);
      revenueByDate[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sum up revenue by date (convert order date to Vietnam timezone)
    orders.forEach((order) => {
      const dateKey = formatDateVN(new Date(order.createdAt));
      if (revenueByDate[dateKey]) {
        revenueByDate[dateKey].revenue += Number(order.total);
        revenueByDate[dateKey].orders += 1;
      }
    });

    const chartData = Object.values(revenueByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate totals
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      period,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      chartData,
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
