import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDataSource } from "@/lib/db/data-source";
import { Address } from "@/lib/db/entities/Address";
import { User } from "@/lib/db/entities/User";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const addressRepo = dataSource.getRepository(Address);

    const user = await userRepo.findOne({ where: { clerkId } });
    if (!user) {
      return NextResponse.json([]);
    }

    const addresses = await addressRepo.find({
      where: { userId: user.id },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, province, district, ward, addressDetail, isDefault } = body;

    if (!fullName || !phone || !addressDetail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const addressRepo = dataSource.getRepository(Address);

    const user = await userRepo.findOne({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If this is default, unset other defaults
    if (isDefault) {
      await addressRepo.update({ userId: user.id }, { isDefault: false });
    }

    // If this is first address, make it default
    const existingCount = await addressRepo.count({ where: { userId: user.id } });
    const shouldBeDefault = isDefault || existingCount === 0;

    const address = addressRepo.create({
      userId: user.id,
      fullName,
      phone,
      province: province || "",
      district: district || "",
      ward: ward || "",
      addressDetail,
      isDefault: shouldBeDefault,
    });

    await addressRepo.save(address);

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
