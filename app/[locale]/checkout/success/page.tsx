"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Home, Gift, Loader2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  
  const [verifying, setVerifying] = useState(true);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [pointsAdded, setPointsAdded] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);

  useEffect(() => {
    // Clear cart after successful payment
    localStorage.removeItem("dinhanstore_cart");

    // Verify payment and update order
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, orderId }),
        });

        if (res.ok) {
          const data = await res.json();
          setOrderNumber(data.orderNumber);
          setPointsAdded(data.pointsAdded);
          setTotalPoints(data.totalPoints);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId]);

  if (verifying) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600">Đang xác nhận thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-emerald-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Thanh toán thành công!
      </h1>
      
      <p className="text-gray-600 mb-4">
        Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.
      </p>

      {orderNumber && (
        <p className="text-sm text-gray-700 mb-4">
          Mã đơn hàng: <span className="font-semibold">{orderNumber}</span>
        </p>
      )}

      {/* Points earned */}
      {pointsAdded && pointsAdded > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
            <Gift className="w-5 h-5" />
            <span className="font-semibold">Điểm thưởng</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">+{pointsAdded.toLocaleString()} điểm</p>
          {totalPoints && (
            <p className="text-sm text-amber-600 mt-1">
              Tổng điểm của bạn: {totalPoints.toLocaleString()} điểm
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          Tiếp tục mua sắm
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <Home className="w-5 h-5" />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
