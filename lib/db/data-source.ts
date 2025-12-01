import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "./entities/Product";
import { Category } from "./entities/Category";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";
import { User } from "./entities/User";
import { Address } from "./entities/Address";
import { Cart } from "./entities/Cart";
import { CartItem } from "./entities/CartItem";

let AppDataSource: DataSource | null = null;

function createDataSource() {
  return new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "dinhanstore",
    synchronize: true,
    logging: false,
    entities: [Product, Category, Order, OrderItem, User, Address, Cart, CartItem],
  });
}

export async function getDataSource(): Promise<DataSource> {
  if (!AppDataSource) {
    AppDataSource = createDataSource();
  }

  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection error:", error);
      // Reset for retry
      AppDataSource = null;
      throw error;
    }
  }

  return AppDataSource;
}
