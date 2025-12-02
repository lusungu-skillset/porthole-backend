import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PotholesController } from './potholes.controller';
import { PotholesService } from './potholes.service';
import { Pothole } from './pothole.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pothole]), AuthModule],
  controllers: [PotholesController],
  providers: [PotholesService]
})
export class PotholesModule {}
