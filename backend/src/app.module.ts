import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PotholesModule } from './potholes/potholes.module';
import { AuthModule } from './auth/auth.module';
import { Pothole } from './potholes/pothole.entity';
import { Admin } from './auth/admin.entity';

const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: DB_PORT,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'pothole',
      database: process.env.DB_NAME || 'pothole_db',
      entities: [Pothole, Admin],
      synchronize: true
    }),
    PotholesModule,
    AuthModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
