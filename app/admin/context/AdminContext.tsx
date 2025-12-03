"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

// Types
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  note: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  brand: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  category?: { id: number; name: string; slug: string };
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
}

interface AdminContextType {
  // Orders
  orders: Order[];
  ordersLoading: boolean;
  fetchOrders: (status?: string) => Promise<void>;
  updateOrderStatus: (orderId: number, status: string) => Promise<boolean>;
  updateOrderNote: (orderId: number, note: string) => Promise<boolean>;
  deleteOrder: (orderId: number) => Promise<boolean>;
  getOrderById: (orderId: number) => Order | undefined;

  // Products
  products: Product[];
  productsLoading: boolean;
  fetchProducts: () => Promise<void>;

  // Stats
  stats: AdminStats;
  refreshStats: () => void;

  // Refresh all data
  refreshAll: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    ordersByStatus: {},
  });

  // Fetch orders
  const fetchOrders = useCallback(async (status?: string) => {
    setOrdersLoading(true);
    try {
      const statusParam = status && status !== "all" ? `&status=${status}` : "";
      console.log("AdminContext: Fetching orders...");
      const res = await fetch(`/api/orders?limit=1000${statusParam}`);
      if (res.ok) {
        const data = await res.json();
        console.log("AdminContext: Orders fetched:", data.orders?.length || 0);
        setOrders(data.orders || []);
      } else {
        console.error("AdminContext: Failed to fetch orders, status:", res.status);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await fetch("/api/products?limit=1000");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Calculate stats from orders and products
  const refreshStats = useCallback(() => {
    const ordersByStatus: Record<string, number> = {};
    orders.forEach((o) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    const deliveredOrders = orders.filter((o) => o.status === "delivered");
    // Calculate revenue from all orders except cancelled
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = validOrders.reduce((sum, o) => {
      const orderTotal = Number(o.total) || 0;
      console.log(`Order ${o.orderNumber}: total=${o.total}, parsed=${orderTotal}`);
      return sum + orderTotal;
    }, 0);
    console.log("AdminContext: Total revenue calculated:", totalRevenue);

    setStats({
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders: ordersByStatus["pending"] || 0,
      processingOrders: ordersByStatus["processing"] || 0,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: ordersByStatus["cancelled"] || 0,
      totalRevenue,
      ordersByStatus,
    });
  }, [orders, products]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: number, status: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        return true;
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
    return false;
  }, []);

  // Update order note
  const updateOrderNote = useCallback(async (orderId: number, note: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, note } : o))
        );
        return true;
      }
    } catch (error) {
      console.error("Error updating order note:", error);
    }
    return false;
  }, []);

  // Delete order
  const deleteOrder = useCallback(async (orderId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        return true;
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
    return false;
  }, []);

  // Get order by ID
  const getOrderById = useCallback(
    (orderId: number) => orders.find((o) => o.id === orderId),
    [orders]
  );

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchOrders(), fetchProducts()]);
  }, [fetchOrders, fetchProducts]);

  // Initial fetch - only run once on mount
  useEffect(() => {
    console.log("AdminContext: Initial fetch starting...");
    fetchOrders();
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update stats when orders or products change
  useEffect(() => {
    refreshStats();
  }, [orders, products, refreshStats]);

  return (
    <AdminContext.Provider
      value={{
        orders,
        ordersLoading,
        fetchOrders,
        updateOrderStatus,
        updateOrderNote,
        deleteOrder,
        getOrderById,
        products,
        productsLoading,
        fetchProducts,
        stats,
        refreshStats,
        refreshAll,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
