import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import type { Order } from "./Order";

// Interface for product snapshot stored in order
export interface ProductSnapshot {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  brand?: string;
  image?: string;
}

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne("Order", "items")
  order!: Order;

  // Store product info as JSON snapshot - no foreign key dependency
  @Column({ type: "json", nullable: true })
  productSnapshot!: ProductSnapshot | null;

  // Keep productId for reference only (no FK constraint)
  @Column({ type: "int", nullable: true })
  productId!: number | null;

  @Column({ length: 200 })
  productName!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column()
  quantity!: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  total!: number;
}
