import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pothole } from './pothole.entity';
import { PotholePhoto } from './pothole-photo.entity';
import { CreatePotholeDto } from './dto/create-pothole.dto';
import { UpdatePotholeDto } from './dto/update-pothole.dto';
import { ReverseGeocodeService } from '../geo/reverse-geocode.service';

@Injectable()
export class PotholesService {
  constructor(
    @InjectRepository(Pothole)
    private readonly repo: Repository<Pothole>,
    @InjectRepository(PotholePhoto)
    private readonly photoRepo: Repository<PotholePhoto>,
    private readonly dataSource: DataSource,
    private readonly reverseGeocode: ReverseGeocodeService
  ) {}

  // Ensure spatial GIST index exists for performance on spatial queries.
  // This runs once when the service is instantiated.
  async ensureSpatialIndex() {
    try {
      await this.dataSource.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = 'idx_potholes_geom'
          ) THEN
            EXECUTE 'CREATE INDEX idx_potholes_geom ON potholes USING GIST (geom)';
          END IF;
        END
        $$;
      `);
    } catch (err) {
      // non-fatal: index creation failures should not break app startup
      console.warn('Could not ensure spatial index:', (err as any)?.message ?? err);
    }
  }
  async create(dto: CreatePotholeDto, files?: Express.Multer.File[]): Promise<Pothole | (Pothole & Record<string, any>)> {
    console.log('PotholesService.create called with dto:', dto, 'files:', files && files.length ? files.map(f=>f.originalname) : files);
    await this.ensureSpatialIndex();

    const severity = (dto.severity ?? 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH';

    const entry = new Pothole();
    entry.latitude = dto.latitude as number;
    entry.longitude = dto.longitude as number;
    entry.description = dto.description as string;
    entry.reporterName = dto.reporterName ?? (dto as any).name ?? 'Anonymous';
    entry.severity = severity;
    entry.status = 'Pending';
    entry.roadName = dto.roadName;
    entry.district = dto.district;

    let saved: Pothole;
    try {
      saved = await this.repo.save(entry);
    } catch (err) {
      console.error('Error saving pothole to DB:', err && (err as any).stack ? (err as any).stack : err);
      throw err;
    }

    // 🔹 HYBRID PART: resolve road name via reverse geocoding API if not provided
    if (!saved.roadName) {
      const road = await this.reverseGeocode.getRoadName(
        saved.latitude,
        saved.longitude,
      );

      if (road) {
        saved.roadName = road;
        saved.roadSource = 'api';
      }
    }

    // 🔹 Auto-populate district if not provided
    if (!saved.district) {
      const district = await this.reverseGeocode.getDistrict(
        saved.latitude,
        saved.longitude,
      );

      if (district) {
        saved.district = district;
      }
    }

    // Save updated fields if either road or district was populated
    if (saved.roadName || saved.district) {
      try {
        await this.repo.save(saved);
      } catch (err) {
        console.warn('Failed to update road/district after reverse geocoding:', err && (err as any).message ? (err as any).message : err);
        // non-fatal: continue even if update fails
      }
    }

    // set PostGIS geometry. If frontend provided GeoJSON `geometry`, use it.
    try {
      if (dto.geometry) {
        await this.dataSource.query(
          'UPDATE potholes SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE id = $2',
          [JSON.stringify(dto.geometry), saved.id]
        );
      } else {
        await this.dataSource.query(
          'UPDATE potholes SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3',
          [dto.longitude, dto.latitude, saved.id]
        );
      }

      // save any uploaded photos (if provided on create endpoint)
      if (files && files.length) {
        for (const file of files) {
          const photo = this.photoRepo.create({
            data: file.buffer,
            filename: file.originalname,
            mimetype: file.mimetype,
            pothole: saved,
          });
          await this.photoRepo.save(photo);
        }
      }

      // fetch the reloaded pothole including photos
      const reloaded = (await this.repo.findOne({ where: { id: saved.id }, relations: ['photos'] })) as Pothole & Record<string, any> | null;
      const result = reloaded ?? saved;

      // If a context geometry was provided, compute closest point and distance
      if (dto.contextGeometry) {
        const res = await this.dataSource.query(
          `SELECT
             ST_AsGeoJSON(ST_ClosestPoint(p.geom, ST_SetSRID(ST_GeomFromGeoJSON($1),4326))) AS closest_point,
             ST_Distance(p.geom::geography, ST_SetSRID(ST_GeomFromGeoJSON($1),4326)::geography) AS distance_m
           FROM potholes p WHERE p.id = $2`,
          [JSON.stringify(dto.contextGeometry), saved.id]
        );
        const computed = res && res[0] ? res[0] : null;
        if (computed) {
          (result as any).closestPoint = computed.closest_point ? JSON.parse(computed.closest_point) : null;
          (result as any).distanceMeters = computed.distance_m;
        }
      }

      return result as Pothole & Record<string, any>;
    } catch (err) {
      return saved;
    }
  }

  async findAll(): Promise<Pothole[]> {
    // return entries and include GeoJSON representation of the geometry
    const rows = await this.dataSource.query(
      `SELECT p.*, ST_AsGeoJSON(p.geom) AS geom_geojson
       FROM potholes p
       ORDER BY p.reported_at DESC`
    );
    return rows.map((r: any) => ({
      ...r,
      geom: r.geom_geojson ? JSON.parse(r.geom_geojson) : null,
    }));
  }

  // Find potholes within a GeoJSON polygon (or geometry). Returns features
  // where ST_Intersects(p.geom, provided_geometry) is true.
  async findWithin(geojson: Record<string, any>): Promise<any[]> {
    const rows = await this.dataSource.query(
      `SELECT p.*, ST_AsGeoJSON(p.geom) AS geom_geojson
       FROM potholes p
       WHERE ST_Intersects(p.geom, ST_SetSRID(ST_GeomFromGeoJSON($1),4326))
       ORDER BY p.reported_at DESC`,
      [JSON.stringify(geojson)]
    );
    return rows.map((r: any) => ({ ...r, geom: r.geom_geojson ? JSON.parse(r.geom_geojson) : null }));
  }

  // Find potholes near a given point (lat, lon) within radius in meters.
  async findNearby(latitude: number, longitude: number, radiusMeters = 100): Promise<any[]> {
    const rows = await this.dataSource.query(
      `SELECT p.*, ST_AsGeoJSON(p.geom) AS geom_geojson,
         ST_Distance(p.geom::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) AS distance_m
       FROM potholes p
       WHERE ST_DWithin(p.geom::geography, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)
       ORDER BY distance_m ASC`,
      [longitude, latitude, radiusMeters]
    );
    return rows.map((r: any) => ({ ...r, geom: r.geom_geojson ? JSON.parse(r.geom_geojson) : null }));
  }

  async update(id: number, dto: UpdatePotholeDto): Promise<Pothole> {
    const pothole = await this.repo.findOneBy({ id });
    if (!pothole) {
      throw new NotFoundException('Pothole not found');
    }
    if (dto.severity) pothole.severity = dto.severity;
    if (dto.status) pothole.status = dto.status;
    if (dto.description) pothole.description = dto.description;
    return this.repo.save(pothole);
  }

  async addPhoto(potholeId: number, file: Express.Multer.File) {
    const pothole = await this.repo.findOneBy({ id: potholeId });
    if (!pothole) throw new NotFoundException('Pothole not found');
    const photo = this.photoRepo.create({
      data: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      pothole
    });
    return this.photoRepo.save(photo);
  }

  async getPhoto(photoId: number) {
    const photo = await this.photoRepo.findOne({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }
}
