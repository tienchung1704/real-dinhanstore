"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "../ui/ProductCard";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  brand: string;
  stock: number;
  images?: string[];
}

interface FeaturedProductsProps {
  locale: string;
}

export function FeaturedProducts({ locale }: FeaturedProductsProps) {
  const t = useTranslations("home.featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?featured=true&limit=8");
        const data = await res.json();

        if (data.products) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        setError("Không thể tải sản phẩm");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Bán chạy nhất</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">{t("title")}</h2>
            <p className="text-gray-500 max-w-lg">
              Khám phá những sản phẩm được yêu thích nhất tại Dinhan Store
            </p>
          </div>
          <Link
            href="/products?featured=true"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-gray-900/20"
          >
            {t("viewAll")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 shadow-sm">
                <div className="aspect-square bg-gray-100 rounded-2xl mb-4 shimmer" />
                <div className="h-4 bg-gray-100 rounded-full mb-3 shimmer" />
                <div className="h-4 bg-gray-100 rounded-full w-2/3 shimmer" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <p className="text-gray-600 font-medium">{error}</p>
            <p className="text-sm text-gray-400 mt-2">Vui lòng thử lại sau</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Chưa có sản phẩm nổi bật</p>
            <p className="text-sm text-gray-400 mt-2">Sản phẩm sẽ sớm được cập nhật</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="stagger-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.salePrice}
                  image={product.images?.[0] || ""}
                  brand={product.brand}
                  stock={product.stock}
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {products.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-xl shadow-emerald-500/30">
              <div className="px-6 py-3 text-white">
                <span className="font-semibold">🎉 Giảm giá đến 50%</span>
                <span className="mx-2 opacity-60">|</span>
                <span>Miễn phí vận chuyển đơn từ 500K</span>
              </div>
              <Link
                href="/products"
                className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Mua ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
