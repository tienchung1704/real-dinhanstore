"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Zap, Truck, Shield, Headphones } from "lucide-react";

interface PromoBannerProps {
  locale: string;
}

export function PromoBanner({ locale }: PromoBannerProps) {
  const t = useTranslations("home.promo");
  const tStats = useTranslations("home.stats");
  const tNewsletter = useTranslations("home.newsletter");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Truck, titleKey: "freeShipping", descKey: "freeShippingDesc", color: "from-emerald-500 to-teal-500" },
            { icon: Shield, titleKey: "warranty", descKey: "warrantyDesc", color: "from-blue-500 to-indigo-500" },
            { icon: Zap, titleKey: "fastDelivery", descKey: "fastDeliveryDesc", color: "from-orange-500 to-red-500" },
            { icon: Headphones, titleKey: "support", descKey: "supportDesc", color: "from-purple-500 to-pink-500" },
          ].map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300 card-hover"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{t(feature.titleKey)}</h3>
              <p className="text-sm text-gray-500">{t(feature.descKey)}</p>
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
                  <span className="text-sm font-medium">{t("specialOffer")}</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  {t("discount", { percent: "50" })}
                  <br />{t("forNewMembers")}
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-md">
                  {t("promoDesc")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href={`/${locale}/products`}
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                  >
                    {t("shopNow")}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                  >
                    {t("learnMore")}
                  </Link>
                </div>
              </div>

              {/* Right content - Stats */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "500+", labelKey: "products", icon: "🏸" },
                  { value: "10K+", labelKey: "customers", icon: "👥" },
                  { value: "50+", labelKey: "brands", icon: "🏆" },
                  { value: "99%", labelKey: "satisfaction", icon: "⭐" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-3xl mb-2 block">{stat.icon}</span>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{tStats(stat.labelKey)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{tNewsletter("title")}</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {tNewsletter("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={tNewsletter("placeholder")}
              className="flex-1 px-6 py-4 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all">
              {tNewsletter("subscribe")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
