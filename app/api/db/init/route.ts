import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST() {
  try {
    // Connect without database to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    const dbName = process.env.DB_NAME || "dinhanstore";

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    return NextResponse.json({
      success: true,
      message: `Database '${dbName}' created successfully!`,
      nextStep: "Now call POST /api/db/seed to add sample data",
    });
  } catch (error: unknown) {
    console.error("Init error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to create database",
        message: errorMessage,
        hint: "Make sure MySQL is running and credentials in .env.local are correct",
      },
      { status: 500 }
    );
  }
}
