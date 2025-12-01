"use client";

import { useState, useMemo } from "react";
import { Eye, Search, Filter, Trash2, X } from "lucide-react";
import { useAdmin, Order } from "../context/AdminContext";

const statusOptions = [
  { value: "pending", label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
  { value: "processing", label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  { value: "shipped", label: "Đang giao", color: "bg-purple-100 text-purple-700" },
  { value: "delivered", label: "Đã giao", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-700" },
];

export default function OrdersPage() {
  const { orders, ordersLoading, updateOrderStatus, updateOrderNote, deleteOrder } = useAdmin();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders locally
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search);
      const matchStatus = filterStatus === "all" || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filterStatus]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success && selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    const success = await deleteOrder(orderId);
    if (success && selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const getStatusStyle = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý đơn hàng</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên hoặc SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tất cả trạng thái</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {ordersLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {Number(order.total).toLocaleString()}đ
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`px-2 py-1 text-xs rounded-full border-0 cursor-pointer ${getStatusStyle(order.status)}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hủy đơn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNote={updateOrderNote}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  onUpdateNote,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  onUpdateNote: (id: number, note: string) => Promise<boolean>;
}) {
  const [note, setNote] = useState(order.note || "");
  const [saving, setSaving] = useState(false);

  const getStatusStyle = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-600";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const saveNote = async () => {
    setSaving(true);
    await onUpdateNote(order.id, note);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Đơn hàng #{order.orderNumber}</h2>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value)}
              className={`px-3 py-1.5 rounded-lg border-0 cursor-pointer ${getStatusStyle(order.status)}`}
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Họ tên:</span>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <span className="text-gray-500">Điện thoại:</span>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{order.customerEmail}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Địa chỉ giao hàng:</span>
                <p className="font-medium">{order.shippingAddress}</p>
              </div>
              <div>
                <span className="text-gray-500">Thanh toán:</span>
                <p className="font-medium">{order.paymentMethod || "COD"}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Sản phẩm</h3>
            <div className="border rounded-lg divide-y">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {Number(item.price).toLocaleString()}đ x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{Number(item.total).toLocaleString()}đ</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tạm tính:</span>
                <span>{Number(order.subtotal).toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển:</span>
                <span>{Number(order.shippingFee).toLocaleString()}đ</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá:</span>
                  <span>-{Number(order.discount).toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-emerald-600">{Number(order.total).toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Ghi chú</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Thêm ghi chú cho đơn hàng..."
            />
            <button
              onClick={saveNote}
              disabled={saving}
              className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              {saving ? "Đang lưu..." : "Lưu ghi chú"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
