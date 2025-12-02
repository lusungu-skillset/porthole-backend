import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { Admin } from './auth/admin.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  const adminRepo = dataSource.getRepository(Admin);

  const admins = [
    {
      email: 'admin1@potholereporter.com',
      password: 'AdminPassword123!'
    },
    {
      email: 'admin2@potholereporter.com',
      password: 'AdminPassword456!'
    }
  ];

  try {
    for (const adminData of admins) {
      const existing = await adminRepo.findOneBy({ email: adminData.email });
      if (!existing) {
        const admin = adminRepo.create(adminData);
        await adminRepo.save(admin);
        console.log(`✓ Created admin: ${adminData.email}`);
      } else {
        console.log(`✓ Admin already exists: ${adminData.email}`);
      }
    }
    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

seed();
