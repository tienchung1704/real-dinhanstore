import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import type { CartItem } from "./CartItem";

@Entity("carts")
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ nullable: true })
  discountCode!: string;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  discountPercent!: number;

  @OneToMany("CartItem", "cart", { cascade: true, eager: true })
  items!: CartItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
