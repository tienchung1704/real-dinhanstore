import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { Category } from "@/lib/db/entities/Category";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const categoryRepo = dataSource.getRepository(Category);
    const categories = await categoryRepo.find();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const categoryRepo = dataSource.getRepository(Category);
    const body = await request.json();
    
    const category = categoryRepo.create(body);
    await categoryRepo.save(category);
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
