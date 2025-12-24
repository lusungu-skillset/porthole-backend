import { Body, Controller, Get, Param, Post, Put, ParseIntPipe, UseGuards, UploadedFile, UseInterceptors, Res, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PotholesService } from './potholes.service';
import { CreatePotholeDto } from './dto/create-pothole.dto';
import { UpdatePotholeDto } from './dto/update-pothole.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('potholes')
export class PotholesController {
  constructor(private readonly service: PotholesService) {}

  @Post()
  // Create a pothole report. Accepts JSON or multipart/form-data with up to
  // 3 `photos` files. The frontend may send either `latitude`/`longitude` or a
  // GeoJSON `geometry`. Optionally a `contextGeometry` GeoJSON may be provided
  // and the backend will compute `ST_ClosestPoint` and `ST_Distance`.
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 3 }]))
  async create(@Body() body: any, @UploadedFiles() files: { photos?: Express.Multer.File[] }) {
    console.log('PotholesController.create: received request');
    console.log('Raw body:', body);
    console.log('Uploaded files:', files && files.photos ? files.photos.map(f => f.originalname) : files);
    // Accept either direct JSON (application/json) or multipart form with a
    // `payload` field (stringified JSON) — common when using curl/git-bash.
    let payload: any = body;
    if (body && typeof body.payload === 'string') {
      try {
        payload = JSON.parse(body.payload);
      } catch (e) {
        // fall through — will be validated below
      }
    }

    // Coerce types (form fields often arrive as strings)
    const latitude = payload.latitude !== undefined ? Number(payload.latitude) : undefined;
    const longitude = payload.longitude !== undefined ? Number(payload.longitude) : undefined;
    const description = payload.description;
    const reporterName = payload.reporterName ?? payload.name ?? 'Anonymous';
    const severityRaw = payload.severity ? String(payload.severity).toUpperCase() : undefined;
    const allowedSev = ['LOW', 'MEDIUM', 'HIGH'];
    const severity = severityRaw && allowedSev.includes(severityRaw) ? (severityRaw as 'LOW' | 'MEDIUM' | 'HIGH') : 'LOW';
    const geometry = payload.geometry;
    const contextGeometry = payload.contextGeometry;

    // Basic validation to provide useful errors for multipart forms
    const errors: string[] = [];
    if (latitude === undefined || Number.isNaN(latitude)) {
      errors.push('latitude must be a number conforming to the specified constraints');
    } else {
      if (latitude > 90) errors.push('latitude must not be greater than 90');
      if (latitude < -90) errors.push('latitude must not be less than -90');
    }
    if (longitude === undefined || Number.isNaN(longitude)) {
      errors.push('longitude must be a number conforming to the specified constraints');
    } else {
      if (longitude > 180) errors.push('longitude must not be greater than 180');
      if (longitude < -180) errors.push('longitude must not be less than -180');
    }
    if (!description || typeof description !== 'string') {
      errors.push('description must be a string');
    } else if (description.length < 5) {
      errors.push('description must be longer than or equal to 5 characters');
    }

    if (errors.length) {
      throw new BadRequestException(errors);
    }

    const dto: CreatePotholeDto = {
      latitude,
      longitude,
      description,
      reporterName,
      severity: severity as any,
      geometry,
      contextGeometry,
    } as CreatePotholeDto;
    try {
      const res = await this.service.create(dto, files?.photos);
      console.log('PotholesController.create: success, id=', (res as any)?.id ?? null);
      return res;
    } catch (err) {
      console.error('PotholesController.create: error', err && (err as any).stack ? (err as any).stack : err);
      throw err;
    }
  }

  // Query potholes within a GeoJSON geometry (e.g., polygon).
  @Post('within')
  async within(@Body() body: { geometry: Record<string, any> }) {
    return this.service.findWithin(body.geometry);
  }

  // Find potholes near a lat/lon within `radiusMeters` (default 100m).
  @Post('nearby')
  async nearby(@Body() body: { latitude: number; longitude: number; radiusMeters?: number }) {
    return this.service.findNearby(body.latitude, body.longitude, body.radiusMeters ?? 100);
  }

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.service.addPhoto(id, file);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePotholeDto) {
    return this.service.update(id, dto);
  }

  @Get(':potholeId/photos/:photoId')
  async getPhoto(@Param('photoId', ParseIntPipe) photoId: number, @Res() res: Response) {
    const photo = await this.service.getPhoto(photoId);
    res.setHeader('Content-Type', photo.mimetype);
    res.send(photo.data);
  }
}
