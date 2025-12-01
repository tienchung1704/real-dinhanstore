import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    
    if (dataSource.isInitialized) {
      return NextResponse.json({
        status: "connected",
        message: "Database connection successful!",
        database: process.env.DB_NAME || "dinhanstore",
        host: process.env.DB_HOST || "localhost",
      });
    }
    
    return NextResponse.json({
      status: "disconnected",
      message: "Database not initialized",
    }, { status: 500 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to connect to database";
    return NextResponse.json({
      status: "error",
      message: errorMessage,
      hint: "Check your .env.local file and make sure MySQL is running",
    }, { status: 500 });
  }
}
