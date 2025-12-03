"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

interface ChartDataItem {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueData {
  chartData: ChartDataItem[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
}

type PeriodType = "today" | "yesterday" | "3days" | "7days" | "custom" | "month";

// Hàm tính giá trị max đẹp cho biểu đồ
function calculateNiceMax(maxValue: number): number {
  if (maxValue <= 0) return 1000000; // Default 1M nếu không có data
  
  // Làm tròn lên đến số đẹp
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalized = maxValue / magnitude;
  
  let niceMax;
  if (normalized <= 1) niceMax = 1;
  else if (normalized <= 2) niceMax = 2;
  else if (normalized <= 5) niceMax = 5;
  else niceMax = 10;
  
  return niceMax * magnitude;
}

export default function AnalyticsPage() {
  const { orders, products, stats, ordersLoading } = useAdmin();

  // Revenue chart state
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("7days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Calculate top products from orders
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; sold: number; revenue: number }> = {};
    orders.forEach((order) => {
      if (order.status !== "cancelled") {
        order.items?.forEach((item) => {
          if (!productSales[item.productName]) {
            productSales[item.productName] = { name: item.productName, sold: 0, revenue: 0 };
          }
          productSales[item.productName].sold += item.quantity;
          productSales[item.productName].revenue += Number(item.total);
        });
      }
    });
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const fetchRevenueData = useCallback(async () => {
    setChartLoading(true);
    try {
      let url = `/api/analytics/revenue?period=${selectedPeriod}`;

      if (selectedPeriod === "custom" && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      } else if (selectedPeriod === "month" && selectedMonth) {
        url += `&month=${selectedMonth}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setRevenueData(result);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setChartLoading(false);
    }
  }, [selectedPeriod, customStartDate, customEndDate, selectedMonth]);

  useEffect(() => {
    if (selectedPeriod === "custom" && (!customStartDate || !customEndDate)) return;
    if (selectedPeriod === "month" && !selectedMonth) return;
    fetchRevenueData();
  }, [selectedPeriod, customStartDate, customEndDate, selectedMonth, fetchRevenueData]);

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const statCards = [
    {
      label: "Doanh thu",
      value: formatPrice(stats.totalRevenue) + "đ",
      icon: DollarSign,
      change: stats.deliveredOrders > 0 ? `${stats.deliveredOrders} đơn` : "0 đơn",
      up: true,
      color: "bg-emerald-500",
    },
    {
      label: "Đơn hàng",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      change: `${stats.pendingOrders} chờ xử lý`,
      up: true,
      color: "bg-blue-500",
    },
    {
      label: "Sản phẩm",
      value: stats.totalProducts.toString(),
      icon: Package,
      change: "Đang bán",
      up: true,
      color: "bg-purple-500",
    },
    {
      label: "Đã giao",
      value: stats.deliveredOrders.toString(),
      icon: Users,
      change: `${stats.cancelledOrders} đã hủy`,
      up: stats.deliveredOrders > stats.cancelledOrders,
      color: "bg-orange-500",
    },
  ];

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} p-2.5 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}
              >
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Biểu đồ doanh thu
          </h2>

          {/* Period Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: "today", label: "Hôm nay" },
              { value: "yesterday", label: "Hôm qua" },
              { value: "3days", label: "3 ngày" },
              { value: "7days", label: "7 ngày" },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as PeriodType)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  selectedPeriod === period.value
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {period.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedPeriod("custom")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1 ${
                selectedPeriod === "custom"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Tùy chọn
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                selectedPeriod === "month"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Theo tháng
            </button>
          </div>
        </div>

        {/* Custom Date Inputs */}
        {selectedPeriod === "custom" && (
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">Từ ngày:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">Đến ngày:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Month Selector */}
        {selectedPeriod === "month" && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="text-sm text-gray-600 font-medium">Chọn tháng:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Chart Content */}
        {chartLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : revenueData && revenueData.chartData.length > 0 ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">
                  {formatPrice(revenueData.summary.totalRevenue)}đ
                </p>
                <p className="text-sm text-gray-600 mt-1">Tổng doanh thu</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">
                  {revenueData.summary.totalOrders}
                </p>
                <p className="text-sm text-gray-600 mt-1">Số đơn hàng</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <p className="text-2xl font-bold text-purple-600">
                  {formatPrice(revenueData.summary.avgOrderValue)}đ
                </p>
                <p className="text-sm text-gray-600 mt-1">Trung bình/đơn</p>
              </div>
            </div>

            {/* Bar Chart - Dynamic max based on highest revenue */}
            {(() => {
              // Tính max value động từ dữ liệu
              const maxRevenue = Math.max(...revenueData.chartData.map(d => d.revenue), 0);
              const chartMaxValue = calculateNiceMax(maxRevenue);
              
              // Tạo labels cho Y-axis
              const yAxisLabels = [
                formatPrice(chartMaxValue),
                formatPrice(chartMaxValue * 0.75),
                formatPrice(chartMaxValue * 0.5),
                formatPrice(chartMaxValue * 0.25),
                "0"
              ];

              return (
                <div className="relative">
                  {/* Y-axis */}
                  <div className="absolute left-0 top-0 bottom-10 w-14 flex flex-col justify-between text-xs text-gray-400">
                    {yAxisLabels.map((label, i) => (
                      <span key={i}>{label}</span>
                    ))}
                  </div>

                  {/* Chart Grid & Bars */}
                  <div className="ml-16 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 bottom-10 flex flex-col justify-between pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-t border-gray-100 w-full" />
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="relative h-64 flex items-end gap-2">
                      {revenueData.chartData.map((item) => {
                        // Tính chiều cao pixel dựa trên max động (256px = h-64)
                        const maxHeight = 256; // h-64 = 16rem = 256px
                        const barHeight = chartMaxValue > 0 
                          ? Math.round((item.revenue / chartMaxValue) * maxHeight)
                          : 0;

                        return (
                          <div
                            key={item.date}
                            className="flex-1 relative group"
                            style={{ height: `${maxHeight}px` }}
                          >
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none z-20 whitespace-nowrap shadow-xl">
                              <p className="font-semibold text-emerald-400">{formatDate(item.date)}</p>
                              <p className="mt-1">💰 {item.revenue.toLocaleString()}đ</p>
                              <p>📦 {item.orders} đơn hàng</p>
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                <div className="border-8 border-transparent border-t-gray-900" />
                              </div>
                            </div>

                            {/* Bar - positioned at bottom */}
                            <div
                              className={`absolute bottom-0 left-0 right-0 mx-0.5 rounded-t transition-all duration-500 cursor-pointer ${
                                item.revenue > 0
                                  ? "bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                              style={{
                                height: item.revenue > 0 ? `${Math.max(barHeight, 4)}px` : "4px",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex gap-1 mt-2 h-8">
                      {revenueData.chartData.map((item) => (
                        <div key={item.date} className="flex-1 text-center">
                          <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-600 to-emerald-400" />
                <span>Doanh thu theo ngày</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <BarChart3 className="w-16 h-16 mb-4 opacity-30" />
            <p>Không có dữ liệu trong khoảng thời gian này</p>
          </div>
        )}
      </div>


      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Đơn hàng theo trạng thái</h2>
          <div className="space-y-4">
            {[
              { key: "pending", label: "Chờ xác nhận", color: "bg-yellow-500", bgLight: "bg-yellow-100" },
              { key: "processing", label: "Đang xử lý", color: "bg-blue-500", bgLight: "bg-blue-100" },
              { key: "shipped", label: "Đang giao", color: "bg-purple-500", bgLight: "bg-purple-100" },
              { key: "delivered", label: "Đã giao", color: "bg-green-500", bgLight: "bg-green-100" },
              { key: "cancelled", label: "Đã hủy", color: "bg-red-500", bgLight: "bg-red-100" },
            ].map((status) => {
              const count = stats.ordersByStatus[status.key] || 0;
              const percent = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;
              return (
                <div key={status.key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">{status.label}</span>
                    <span className="font-semibold text-gray-900">
                      {count} <span className="text-gray-400 font-normal">({percent.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className={`h-2.5 ${status.bgLight} rounded-full overflow-hidden`}>
                    <div
                      className={`h-full ${status.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sản phẩm bán chạy</h2>
          {topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có dữ liệu bán hàng</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                          ? "bg-gray-200 text-gray-600"
                          : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sold} đã bán</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatPrice(product.revenue)}đ
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Tổng quan doanh thu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
            <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-emerald-600">{formatPrice(stats.totalRevenue)}đ</p>
            <p className="text-sm text-gray-600 mt-2">Tổng doanh thu</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.deliveredOrders}</p>
            <p className="text-sm text-gray-600 mt-2">Đơn hoàn thành</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {stats.deliveredOrders > 0
                ? formatPrice(stats.totalRevenue / stats.deliveredOrders) + "đ"
                : "0đ"}
            </p>
            <p className="text-sm text-gray-600 mt-2">Giá trị TB/đơn</p>
          </div>
        </div>
      </div>
    </div>
  );
}
