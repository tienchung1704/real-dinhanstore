import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Product } from "@/lib/db/entities/Product";
import { Category } from "@/lib/db/entities/Category";

const categoriesData = [
  {
    name: "Vợt cầu lông",
    slug: "vot",
    description: "Các loại vợt cầu lông chính hãng",
    subcategories: ["Vợt cầu lông Lining", "Vợt cầu lông Yonex", "Vợt cầu lông Kumpoo", "Vợt cầu lông Victor", "Vợt cầu lông Mizuno", "Vợt cầu lông VS", "Vợt cầu lông Wsport"],
  },
  {
    name: "Giày thể thao",
    slug: "giay",
    description: "Giày cầu lông chuyên dụng",
    subcategories: ["Giày cầu lông Kawasaki", "Giày cầu lông Kumpo", "Giày cầu lông Lining", "Giày cầu lông Mizuno", "Giày cầu lông Victor", "Giày cầu lông Yonex"],
  },
  {
    name: "Áo cầu lông",
    slug: "ao",
    description: "Áo thể thao cầu lông",
    subcategories: ["Áo cầu lông Lining", "Áo cầu lông Yonex", "Áo cầu lông Victor", "Áo cầu lông Coolmax 1", "Áo cầu lông Coolmax 2"],
  },
  {
    name: "Balo cầu lông",
    slug: "balo",
    description: "Balo và túi đựng vợt",
    subcategories: ["Balo Victor", "Balo Yonex", "Balo Lining"],
  },
  {
    name: "Phụ kiện",
    slug: "phukien",
    description: "Phụ kiện cầu lông",
    subcategories: ["Dây căng vợt", "Hộp Cầu lông", "Cuốn cán", "Băng chặn mồ hôi"],
  },
  {
    name: "Máy căng vợt",
    slug: "may",
    description: "Máy căng dây vợt",
    subcategories: ["Việt Nam", "Nhật Bản", "Trung Quốc", "Hoa Kỳ"],
  },
];

const productsData = [
  { name: "Vợt Yonex Astrox 99 Pro", slug: "vot-yonex-astrox-99-pro", price: 4500000, salePrice: 3900000, brand: "Yonex", stock: 15, categorySlug: "vot", isFeatured: true },
  { name: "Vợt Yonex Nanoflare 800", slug: "vot-yonex-nanoflare-800", price: 3800000, brand: "Yonex", stock: 10, categorySlug: "vot", isFeatured: true },
  { name: "Vợt Victor Thruster Ryuga II", slug: "vot-victor-thruster-ryuga-ii", price: 3600000, brand: "Victor", stock: 8, categorySlug: "vot", isFeatured: true },
  { name: "Vợt Lining Aeronaut 9000C", slug: "vot-lining-aeronaut-9000c", price: 3200000, salePrice: 2800000, brand: "Lining", stock: 12, categorySlug: "vot" },
  { name: "Vợt Kumpoo Power Control K520", slug: "vot-kumpoo-power-control-k520", price: 1800000, brand: "Kumpoo", stock: 20, categorySlug: "vot" },
  { name: "Giày Yonex Power Cushion 65Z3", slug: "giay-yonex-power-cushion-65z3", price: 3200000, brand: "Yonex", stock: 15, categorySlug: "giay", isFeatured: true },
  { name: "Giày Victor A960", slug: "giay-victor-a960", price: 2800000, salePrice: 2400000, brand: "Victor", stock: 10, categorySlug: "giay" },
  { name: "Giày Lining Ranger TD", slug: "giay-lining-ranger-td", price: 2200000, brand: "Lining", stock: 18, categorySlug: "giay" },
  { name: "Giày Mizuno Wave Claw Neo", slug: "giay-mizuno-wave-claw-neo", price: 3500000, brand: "Mizuno", stock: 6, categorySlug: "giay" },
  { name: "Áo Yonex 10512", slug: "ao-yonex-10512", price: 850000, brand: "Yonex", stock: 30, categorySlug: "ao" },
  { name: "Áo Lining AAYR381", slug: "ao-lining-aayr381", price: 650000, salePrice: 550000, brand: "Lining", stock: 25, categorySlug: "ao" },
  { name: "Áo Victor T-40010", slug: "ao-victor-t-40010", price: 720000, brand: "Victor", stock: 22, categorySlug: "ao" },
  { name: "Balo Yonex BA92212", slug: "balo-yonex-ba92212", price: 1800000, brand: "Yonex", stock: 8, categorySlug: "balo" },
  { name: "Balo Victor BR9008", slug: "balo-victor-br9008", price: 1200000, brand: "Victor", stock: 12, categorySlug: "balo" },
  { name: "Cuốn cán Yonex AC102", slug: "cuon-can-yonex-ac102", price: 50000, brand: "Yonex", stock: 100, categorySlug: "phukien" },
  { name: "Dây căng vợt BG65", slug: "day-cang-vot-bg65", price: 120000, brand: "Yonex", stock: 50, categorySlug: "phukien" },
];

export async function POST() {
  try {
    const dataSource = await getDataSource();
    const categoryRepo = dataSource.getRepository(Category);
    const productRepo = dataSource.getRepository(Product);

    // Check if data already exists
    const existingCategories = await categoryRepo.count();
    if (existingCategories > 0) {
      return NextResponse.json({
        message: "Data already seeded",
        categories: existingCategories,
        products: await productRepo.count(),
      });
    }

    // Create categories
    const categories: Record<string, Category> = {};
    for (const catData of categoriesData) {
      const category = categoryRepo.create(catData);
      await categoryRepo.save(category);
      categories[catData.slug] = category;
    }

    // Create products
    for (const prodData of productsData) {
      const { categorySlug, ...productFields } = prodData;
      const product = productRepo.create({
        ...productFields,
        description: `${prodData.name} - Sản phẩm chính hãng, bảo hành 12 tháng`,
        category: categories[categorySlug],
        isActive: true,
        isFeatured: prodData.isFeatured || false,
      });
      await productRepo.save(product);
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      categories: categoriesData.length,
      products: productsData.length,
    });
  } catch (error: unknown) {
    console.error("Seed error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      error: "Failed to seed database",
      message: errorMessage,
    }, { status: 500 });
  }
}
