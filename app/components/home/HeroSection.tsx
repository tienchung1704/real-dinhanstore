"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Sparkles, ShoppingBag, Star } from "lucide-react";

interface HeroSectionProps {
  locale: string;
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations("home.hero");

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-90" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl float" style={{ animationDelay: "-1.5s" }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Decorative shapes */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Chất lượng hàng đầu Việt Nam</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              {t("title")}
              <span className="block mt-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Badminton
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-white/80 max-w-lg leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">500+</div>
                <div className="text-sm text-white/60">Sản phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">10K+</div>
                <div className="text-sm text-white/60">Khách hàng</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-3xl font-bold text-cyan-400">
                  4.9 <Star className="w-6 h-6 fill-current" />
                </div>
                <div className="text-sm text-white/60">Đánh giá</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/products`}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-xl shadow-black/20 btn-shine"
              >
                <ShoppingBag className="w-5 h-5" />
                {t("shopNow")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/products?featured=true`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                {t("viewCollection")}
              </Link>
            </div>
          </div>

          {/* Right content - 3D-like product showcase */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square">
              {/* Main product card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-80 h-96 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 card-hover">
                  {/* Product image placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-32 h-32 text-white/40" viewBox="0 0 100 100" fill="currentColor">
                      <ellipse cx="50" cy="35" rx="25" ry="30" />
                      <rect x="45" y="60" width="10" height="35" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded-full w-3/4" />
                    <div className="h-3 bg-white/10 rounded-full w-1/2" />
                    <div className="flex items-center justify-between mt-4">
                      <div className="h-6 bg-yellow-400/80 rounded-full w-24" />
                      <div className="w-10 h-10 bg-white/20 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-sm font-bold text-white shadow-lg badge-pulse">
                    HOT 🔥
                  </div>
                </div>
              </div>

              {/* Decorative floating elements */}
              <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-400/80 rounded-2xl flex items-center justify-center shadow-lg float" style={{ animationDelay: "-2s" }}>
                <span className="text-2xl">🏸</span>
              </div>
              <div className="absolute bottom-20 left-0 w-14 h-14 bg-pink-500/80 rounded-2xl flex items-center justify-center shadow-lg float" style={{ animationDelay: "-1s" }}>
                <span className="text-xl">👟</span>
              </div>
              <div className="absolute top-1/3 right-0 w-12 h-12 bg-cyan-500/80 rounded-2xl flex items-center justify-center shadow-lg float" style={{ animationDelay: "-3s" }}>
                <span className="text-lg">🎒</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fafbfc"/>
        </svg>
      </div>
    </section>
  );
}
