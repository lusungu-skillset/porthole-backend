import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PotholePhoto } from './pothole-photo.entity';

@Entity({ name: 'potholes' })
export class Pothole {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'double precision' })
  latitude!: number;

  @Column({ type: 'double precision' })
  longitude!: number;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  geom?: string | object;

  @Column('text')
  description!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  // Stored in DB as `road_name` (snake_case)
  @Column({ name: 'road_name', type: 'varchar', length: 120, nullable: true })
  roadName?: string;

  @Column({ name: 'road_source', type: 'varchar', length: 50, nullable: true })
  roadSource?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  district?: string;

  @Column({ type: 'varchar', length: 10, default: 'LOW' })
  severity!: 'LOW' | 'MEDIUM' | 'HIGH';

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  status!: 'Pending' | 'In Progress' | 'Fixed';

  @CreateDateColumn({ name: 'reported_at' })
  reportedAt!: Date;

  @Column({ name: 'reporter_name', type: 'varchar', length: 120 })
  reporterName!: string;

  @OneToMany(() => PotholePhoto, (p) => p.pothole)
  photos?: PotholePhoto[];
}
