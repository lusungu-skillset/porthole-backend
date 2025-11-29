import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'potholes' })
export class Pothole {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('double')
  latitude!: number;

  @Column('double')
  longitude!: number;

  @Column('text')
  description!: string;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status!: string;

  @CreateDateColumn({ name: 'reported_at' })
  reportedAt!: Date;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string | null;

  @Column({ name: 'reporter_name', type: 'varchar', length: 120 })
  reporterName!: string;
}
