import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDataSource } from "@/lib/db/data-source";
import { Address } from "@/lib/db/entities/Address";
import { User } from "@/lib/db/entities/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const addressId = parseInt(id);

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);
    const addressRepo = dataSource.getRepository(Address);

    const user = await userRepo.findOne({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const address = await addressRepo.findOne({
      where: { id: addressId, userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Unset all defaults for this user
    await addressRepo.update({ userId: user.id }, { isDefault: false });

    // Set this address as default
    address.isDefault = true;
    await addressRepo.save(address);

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error setting default address:", error);
    return NextResponse.json({ error: "Failed to set default address" }, { status: 500 });
  }
}
