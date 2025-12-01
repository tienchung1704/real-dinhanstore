"use client";

import { useState } from "react";
import { Save, Store, Bell, Shield, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    name: "Dinhan Store",
    email: "contact@dinhanstore.com",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  });

  const [notifications, setNotifications] = useState({
    newOrder: true,
    lowStock: true,
    newsletter: false,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>

      <div className="space-y-6">
        {/* Store Info */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Store className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Thông tin cửa hàng</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
                <input
                  type="text"
                  value={storeSettings.name}
                  onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={storeSettings.email}
                  onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={storeSettings.phone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={storeSettings.address}
                  onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Thông báo</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Đơn hàng mới</p>
                <p className="text-sm text-gray-500">Nhận thông báo khi có đơn hàng mới</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.newOrder}
                onChange={(e) => setNotifications({ ...notifications, newOrder: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Cảnh báo tồn kho</p>
                <p className="text-sm text-gray-500">Thông báo khi sản phẩm sắp hết hàng</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.lowStock}
                onChange={(e) => setNotifications({ ...notifications, lowStock: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Bản tin</p>
                <p className="text-sm text-gray-500">Nhận email về tính năng mới và cập nhật</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.newsletter}
                onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Thanh toán</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-600 rounded" />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-600 rounded" />
                <span>Chuyển khoản ngân hàng</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" />
                <span>Ví điện tử (MoMo, ZaloPay)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Bảo mật</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Save className="w-5 h-5" />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
