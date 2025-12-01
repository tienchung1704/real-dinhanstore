import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import type { Product } from "./Product";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({ type: "simple-array", nullable: true })
  subcategories!: string[];

  @OneToMany("Product", "category")
  products!: Product[];

  @CreateDateColumn()
  createdAt!: Date;
}
