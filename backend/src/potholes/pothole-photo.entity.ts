import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pothole } from './pothole.entity';

@Entity({ name: 'pothole_photos' })
export class PotholePhoto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'bytea' })
  data!: Buffer;

  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @Column({ type: 'varchar', length: 100 })
  mimetype!: string;

  @ManyToOne(() => Pothole, (p) => p.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pothole_id' })
  pothole!: Pothole;
}
