import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, firstName, lastName, email, phone, avatar } = body;

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    // Check if user exists
    let user = await userRepo.findOne({ where: { clerkId } });

    if (user) {
      // Update existing user
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.phone = phone || user.phone;
      user.avatar = avatar;
    } else {
      // Create new user
      user = userRepo.create({
        clerkId,
        firstName,
        lastName,
        email,
        phone,
        avatar,
        role: "customer",
        isActive: true,
      });
    }

    await userRepo.save(user);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
