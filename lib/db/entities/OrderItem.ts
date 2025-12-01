import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import type { Order } from "./Order";
import type { Product } from "./Product";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne("Order", "items")
  order!: Order;

  @ManyToOne("Product")
  product!: Product;

  @Column()
  productId!: number;

  @Column({ length: 200 })
  productName!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column()
  quantity!: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  total!: number;
}
