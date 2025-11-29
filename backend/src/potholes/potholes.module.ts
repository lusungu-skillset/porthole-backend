import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PotholesController } from './potholes.controller';
import { PotholesService } from './potholes.service';
import { Pothole } from './pothole.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pothole])],
  controllers: [PotholesController],
  providers: [PotholesService]
})
export class PotholesModule {}
