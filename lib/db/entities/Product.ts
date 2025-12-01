import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Category } from "./Category";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 200, unique: true })
  slug!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  price!: number;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  salePrice!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ nullable: true })
  brand!: string;

  @Column("simple-array", { nullable: true })
  images!: string[];

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isFeatured!: boolean;

  @ManyToOne(() => Category, (category) => category.products)
  category!: Category;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
