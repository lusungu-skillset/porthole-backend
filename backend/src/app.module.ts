import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PotholesModule } from './potholes/potholes.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { Pothole } from './potholes/pothole.entity';
import { PotholePhoto } from './potholes/pothole-photo.entity';
import { Admin } from './auth/admin.entity';

const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: DB_PORT,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'pothole',
      database: process.env.DB_NAME || 'pothole_db',
      entities: [Pothole, PotholePhoto, Admin],
      synchronize: process.env.TYPEORM_SYNC === 'true'
    }),
    PotholesModule,
    AuthModule,
    AdminModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
