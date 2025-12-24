import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'admins' })
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  // bcrypt hashed password
  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  // role-based access (future-proof)
  @Column({ type: 'varchar', length: 50, default: 'ADMIN' })
  role!: 'ADMIN';

  // soft security control
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
