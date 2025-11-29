import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PotholesModule } from './potholes/potholes.module';
import { Pothole } from './potholes/pothole.entity';

const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: DB_PORT,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'pothole_db',
      entities: [Pothole],
      synchronize: true
    })
    ,
    PotholesModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
