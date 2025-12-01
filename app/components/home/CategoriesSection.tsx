"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoriesSectionProps {
  locale: string;
}

const categories = [
  {
    slug: "vot",
    icon: "🏸",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    shadowColor: "shadow-emerald-500/30",
  },
  {
    slug: "giay",
    icon: "👟",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    shadowColor: "shadow-blue-500/30",
  },
  {
    slug: "ao",
    icon: "👕",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    shadowColor: "shadow-purple-500/30",
  },
  {
    slug: "balo",
    icon: "🎒",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    shadowColor: "shadow-orange-500/30",
  },
  {
    slug: "phukien",
    icon: "🔧",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-50",
    shadowColor: "shadow-cyan-500/30",
  },
  {
    slug: "may",
    icon: "⚙️",
    color: "from-gray-600 to-gray-800",
    bgColor: "bg-gray-100",
    shadowColor: "shadow-gray-500/30",
  },
];

const categoryNames: Record<string, { vi: string; en: string }> = {
  vot: { vi: "Vợt cầu lông", en: "Rackets" },
  giay: { vi: "Giày cầu lông", en: "Shoes" },
  ao: { vi: "Quần áo", en: "Apparel" },
  balo: { vi: "Balo & Túi", en: "Bags" },
  phukien: { vi: "Phụ kiện", en: "Accessories" },
  may: { vi: "Máy căng vợt", en: "Stringing" },
};

export function CategoriesSection({ locale }: CategoriesSectionProps) {
  const t = useTranslations("home.categories");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("title")}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Khám phá đầy đủ các danh mục sản phẩm cầu lông chất lượng cao
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/${locale}/products?category=${category.slug}`}
              className="group relative stagger-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`relative p-6 ${category.bgColor} rounded-3xl overflow-hidden transition-all duration-500 group-hover:shadow-2xl ${category.shadowColor} card-hover`}>
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-500">
                    {category.icon}
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-bold text-gray-900 group-hover:text-white transition-colors duration-500 text-sm lg:text-base">
                    {categoryNames[category.slug]?.[locale as "vi" | "en"] || category.slug}
                  </h3>
                  
                  {/* Arrow */}
                  <div className="mt-3 flex items-center gap-1 text-gray-400 group-hover:text-white/80 transition-colors duration-500">
                    <span className="text-xs font-medium">Xem thêm</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Decorative circle */}
                <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${category.color} rounded-full opacity-20 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500`} />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 lg:p-12">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Không tìm thấy sản phẩm cần tìm?
              </h3>
              <p className="text-gray-400">
                Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl hover:bg-gray-100 transition-colors shadow-xl"
              >
                Xem tất cả sản phẩm
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                Liên hệ ngay
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
}
