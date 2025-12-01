"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Bell, Globe, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    promotions: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
            <p className="text-sm text-gray-500">Quản lý cài đặt thông báo</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Thông báo qua Email</p>
              <p className="text-sm text-gray-500">Nhận cập nhật đơn hàng qua email</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.checked })
              }
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Thông báo SMS</p>
              <p className="text-sm text-gray-500">Nhận tin nhắn về đơn hàng</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) =>
                setNotifications({ ...notifications, sms: e.target.checked })
              }
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">Khuyến mãi</p>
              <p className="text-sm text-gray-500">Nhận thông tin ưu đãi và khuyến mãi</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.promotions}
              onChange={(e) =>
                setNotifications({ ...notifications, promotions: e.target.checked })
              }
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Ngôn ngữ</h2>
            <p className="text-sm text-gray-500">Chọn ngôn ngữ hiển thị</p>
          </div>
        </div>

        <select className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Bảo mật</h2>
            <p className="text-sm text-gray-500">Quản lý bảo mật tài khoản</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <p className="font-medium text-gray-900">Đổi mật khẩu</p>
            <p className="text-sm text-gray-500">Cập nhật mật khẩu đăng nhập</p>
          </button>
          <button className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <p className="font-medium text-gray-900">Xác thực 2 bước</p>
            <p className="text-sm text-gray-500">Bảo vệ tài khoản với xác thực 2 bước</p>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        <Save className="w-5 h-5" />
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
