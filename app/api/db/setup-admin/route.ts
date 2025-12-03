import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

// POST /api/db/setup-admin
// Body: { email: "admin@example.com", secretKey: "your-secret-key" }
// Or just call with secretKey to make the first user admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secretKey } = body;

    // Simple secret key protection - change this in production!
    const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || "dinhanstore-setup-2024";
    
    if (secretKey !== SETUP_SECRET) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 403 }
      );
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    let user: User | null = null;

    if (email) {
      // Find user by email
      user = await userRepo.findOne({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { error: `User with email ${email} not found` },
          { status: 404 }
        );
      }
    } else {
      // Get the first user
      user = await userRepo.findOne({ 
        where: {},
        order: { createdAt: "ASC" }
      });
      if (!user) {
        return NextResponse.json(
          { error: "No users found in database" },
          { status: 404 }
        );
      }
    }

    // Update role to admin
    user.role = "admin";
    await userRepo.save(user);

    return NextResponse.json({
      success: true,
      message: `User ${user.email} is now admin`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error setting up admin:", error);
    return NextResponse.json(
      { error: "Failed to setup admin" },
      { status: 500 }
    );
  }
}

// GET - Check current admins
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secretKey");

    const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || "dinhanstore-setup-2024";
    
    if (secretKey !== SETUP_SECRET) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 403 }
      );
    }

    const dataSource = await getDataSource();
    const userRepo = dataSource.getRepository(User);

    const admins = await userRepo.find({
      where: { role: "admin" },
      select: ["id", "email", "firstName", "lastName", "role", "createdAt"],
    });

    const totalUsers = await userRepo.count();

    return NextResponse.json({
      totalUsers,
      admins,
      message: admins.length === 0 
        ? "No admins found. Use POST to set up an admin." 
        : `Found ${admins.length} admin(s)`,
    });
  } catch (error) {
    console.error("Error checking admins:", error);
    return NextResponse.json(
      { error: "Failed to check admins" },
      { status: 500 }
    );
  }
}
