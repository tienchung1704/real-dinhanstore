"use client";

import Link from "next/link";
import { ArrowRight, Zap, Truck, Shield, Headphones } from "lucide-react";

interface PromoBannerProps {
  locale: string;
}

export function PromoBanner({ locale }: PromoBannerProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn hàng từ 500K", color: "from-emerald-500 to-teal-500" },
            { icon: Shield, title: "Bảo hành chính hãng", desc: "Đổi trả trong 30 ngày", color: "from-blue-500 to-indigo-500" },
            { icon: Zap, title: "Giao hàng nhanh", desc: "Nhận hàng trong 24h", color: "from-orange-500 to-red-500" },
            { icon: Headphones, title: "Hỗ trợ 24/7", desc: "Tư vấn nhiệt tình", color: "from-purple-500 to-pink-500" },
          ].map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 card-hover"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Main Promo Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>

          <div className="relative z-10 p-8 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Ưu đãi đặc biệt</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Giảm đến <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">50%</span>
                  <br />cho thành viên mới
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-md">
                  Đăng ký ngay để nhận ưu đãi độc quyền và tích điểm với mỗi đơn hàng
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/${locale}/products`}
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                  >
                    Mua sắm ngay
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                  >
                    Tìm hiểu thêm
                  </Link>
                </div>
              </div>

              {/* Right content - Stats */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "500+", label: "Sản phẩm", icon: "🏸" },
                  { value: "10K+", label: "Khách hàng", icon: "👥" },
                  { value: "50+", label: "Thương hiệu", icon: "🏆" },
                  { value: "99%", label: "Hài lòng", icon: "⭐" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-3xl mb-2 block">{stat.icon}</span>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Đăng ký nhận tin</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Nhận thông tin khuyến mãi và sản phẩm mới nhất từ Dinhan Store
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-6 py-4 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
