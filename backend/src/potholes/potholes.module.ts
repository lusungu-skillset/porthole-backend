import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PotholesController } from './potholes.controller';
import { PotholesService } from './potholes.service';
import { Pothole } from './pothole.entity';
import { PotholePhoto } from './pothole-photo.entity';
import { ReverseGeocodeService } from '../geo/reverse-geocode.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pothole, PotholePhoto]), AuthModule],
  controllers: [PotholesController],
  providers: [PotholesService, ReverseGeocodeService]
})
export class PotholesModule {}
