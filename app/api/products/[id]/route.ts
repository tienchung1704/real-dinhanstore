import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Product } from "@/lib/db/entities/Product";
import { CartItem } from "@/lib/db/entities/CartItem";

// GET single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);

    const product = await productRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["category"],
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);
    const body = await request.json();

    const product = await productRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["category"],
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update slug if name changed
    if (body.name && body.name !== product.name) {
      body.slug = body.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Handle categoryId
    const { categoryId, ...updateData } = body;
    
    Object.assign(product, updateData);
    
    if (categoryId) {
      product.category = { id: categoryId } as typeof product.category;
    }
    
    await productRepo.save(product);

    // Fetch updated product with relations
    const updatedProduct = await productRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["category"],
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);
    const cartItemRepo = dataSource.getRepository(CartItem);

    const product = await productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete related cart items first
    await cartItemRepo.delete({ productId });

    // Set productId to NULL for order_items (keep order history with productSnapshot)
    await dataSource.query(
      "UPDATE order_items SET productId = NULL WHERE productId = ?",
      [productId]
    );

    // Now delete the product
    await productRepo.remove(product);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
