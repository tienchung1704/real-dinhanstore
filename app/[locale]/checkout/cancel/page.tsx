"use client";

import Link from "next/link";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-10 h-10 text-red-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Thanh toán bị hủy
      </h1>
      
      <p className="text-gray-600 mb-8">
        Đơn hàng của bạn chưa được thanh toán. Giỏ hàng của bạn vẫn được giữ nguyên.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          Quay lại giỏ hàng
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
