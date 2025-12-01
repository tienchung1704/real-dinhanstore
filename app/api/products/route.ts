import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Product } from "@/lib/db/entities/Product";

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "ASC" : "DESC";

    let query = productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .where("product.isActive = :isActive", { isActive: true });

    if (category) {
      query = query.andWhere("category.slug = :category", { category });
    }
    if (brand) {
      query = query.andWhere("product.brand = :brand", { brand });
    }
    if (featured === "true") {
      query = query.andWhere("product.isFeatured = :isFeatured", {
        isFeatured: true,
      });
    }
    if (search) {
      query = query.andWhere("product.name LIKE :search", {
        search: `%${search}%`,
      });
    }
    if (minPrice) {
      query = query.andWhere("product.price >= :minPrice", {
        minPrice: parseFloat(minPrice),
      });
    }
    if (maxPrice) {
      query = query.andWhere("product.price <= :maxPrice", {
        maxPrice: parseFloat(maxPrice),
      });
    }

    // Get total count for pagination
    const total = await query.getCount();

    // Apply sorting and pagination
    const products = await query
      .orderBy(`product.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);
    const body = await request.json();

    // Generate slug from name
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Handle categoryId
    const { categoryId, ...productData } = body;

    const productToCreate: Partial<Product> = {
      ...productData,
      slug,
      category: categoryId ? { id: categoryId } : undefined,
    };
    
    const result = await productRepo.insert(productToCreate);
    const insertedId = result.identifiers[0].id;

    // Fetch with relations
    const savedProduct = await productRepo.findOne({
      where: { id: insertedId },
      relations: ["category"],
    });

    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
