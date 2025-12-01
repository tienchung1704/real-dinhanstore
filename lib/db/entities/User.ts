import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "./Order";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  clerkId!: string;

  @Column({ length: 100, nullable: true })
  firstName!: string;

  @Column({ length: 100, nullable: true })
  lastName!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 20, nullable: true })
  phone!: string;

  @Column({ type: "text", nullable: true })
  avatar!: string;

  @Column({ type: "text", nullable: true })
  address!: string;

  @Column({ default: "customer" })
  role!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  points!: number;

  @OneToMany(() => Order, (order) => order.userId)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
