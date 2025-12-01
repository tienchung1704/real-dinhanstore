"use client";

import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: React.ReactNode;
  locale: string;
}

export function CategoryCard({ name, slug, icon, locale }: CategoryCardProps) {
  return (
    <Link href={`/${locale}/products?category=${slug}`}>
      <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 text-center cursor-pointer">
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900">{name}</h3>
      </div>
    </Link>
  );
}
