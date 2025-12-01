import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { OrderItem } from "./OrderItem";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 20, unique: true })
  orderNumber!: string;

  @Column({ length: 100 })
  customerName!: string;

  @Column({ length: 100 })
  customerEmail!: string;

  @Column({ length: 20 })
  customerPhone!: string;

  @Column({ type: "text" })
  shippingAddress!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  subtotal!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  shippingFee!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  discount!: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  total!: number;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: string;

  @Column({ nullable: true })
  paymentMethod!: string;

  @Column({ type: "varchar", length: 20, default: "pending" })
  paymentStatus!: string; // pending, paid, failed

  @Column({ nullable: true })
  stripeSessionId!: string;

  @Column({ nullable: true })
  note!: string;

  @Column({ nullable: true })
  userId!: string;

  @OneToMany("OrderItem", "order", { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
