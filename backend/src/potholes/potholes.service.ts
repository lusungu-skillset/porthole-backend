import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pothole } from './pothole.entity';
import { CreatePotholeDto } from './dto/create-pothole.dto';
import { UpdatePotholeDto } from './dto/update-pothole.dto';

@Injectable()
export class PotholesService {
  constructor(
    @InjectRepository(Pothole)
    private readonly repo: Repository<Pothole>
  ) {}

  async create(dto: CreatePotholeDto): Promise<Pothole> {
    const entry = this.repo.create({
      latitude: dto.latitude,
      longitude: dto.longitude,
      description: dto.description,
      reporterName: dto.reporterName,
      severity: dto.severity ?? 'LOW',
      status: 'Pending'
    });
    return this.repo.save(entry);
  }

  async findAll(): Promise<Pothole[]> {
    return this.repo.find({ order: { reportedAt: 'DESC' } });
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
}
