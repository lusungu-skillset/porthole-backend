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

  @Column({ type: 'varchar', length: 10, default: 'LOW' })
  severity!: 'LOW' | 'MEDIUM' | 'HIGH';

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status!: 'Pending' | 'In Progress' | 'Fixed';

  @CreateDateColumn({ name: 'reported_at' })
  reportedAt!: Date;

  @Column({ name: 'reporter_name', type: 'varchar', length: 120 })
  reporterName!: string;
}
