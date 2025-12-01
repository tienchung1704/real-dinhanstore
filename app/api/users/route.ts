import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    const users = await userRepo.find({
      order: { createdAt: "DESC" },
      take: 20,
    });

    return NextResponse.json({
      total: users.length,
      users: users.map((u) => ({
        id: u.id,
        clerkId: u.clerkId,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
