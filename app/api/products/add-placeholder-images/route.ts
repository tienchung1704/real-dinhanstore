import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Product } from "@/lib/db/entities/Product";

// Placeholder image URLs (you can replace with real images later)
const placeholderImages = [
  "https://placehold.co/400x400/10b981/white?text=Badminton+1",
  "https://placehold.co/400x400/059669/white?text=Badminton+2",
  "https://placehold.co/400x400/047857/white?text=Badminton+3",
  "https://placehold.co/400x400/065f46/white?text=Badminton+4",
];

export async function POST() {
  try {
    const dataSource = await getDataSource();
    const productRepo = dataSource.getRepository(Product);

    const products = await productRepo.find();
    let updated = 0;

    for (const product of products) {
      if (!product.images || product.images.length === 0) {
        // Assign a random placeholder image
        const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
        product.images = [randomImage];
        await productRepo.save(product);
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added placeholder images to ${updated} products`,
      updated,
    });
  } catch (error: unknown) {
    console.error("Error adding placeholder images:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to add placeholder images", message: errorMessage },
      { status: 500 }
    );
  }
}
