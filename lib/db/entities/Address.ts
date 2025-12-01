import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ length: 100 })
  fullName!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ length: 100, nullable: true })
  province!: string;

  @Column({ length: 100, nullable: true })
  district!: string;

  @Column({ length: 100, nullable: true })
  ward!: string;

  @Column({ type: "text" })
  addressDetail!: string;

  @Column({ default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
