import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDataSource } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      points: Number(user.points) || 0,
      role: user.role,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
