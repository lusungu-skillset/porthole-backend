import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Admin } from './auth/admin.entity';


dotenv.config();


export async function seedAdmin(dataSource: DataSource) {
  const repo = dataSource.getRepository(Admin);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
  }

  const exists = await repo.findOne({ where: { email } });
  if (exists) {
    console.log('✅ Admin already exists. Seed skipped.');
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = repo.create({ email, password: hashed });
  await repo.save(admin);

  console.log('✅ Admin seeded securely:', email);
}

// If run directly, create a DataSource and execute the seeding
if (require.main === module) {
  (async () => {
    const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: DB_PORT,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'pothole',
      database: process.env.DB_NAME || 'pothole_db',
      entities: [Admin],
      synchronize: true,
    });

    try {
      console.log('➡️ Initializing database connection...');
      await dataSource.initialize();
      console.log('➡️ Running admin seed...');
      await seedAdmin(dataSource);
      console.log('✅ Seeding complete');
    } catch (err) {
      console.error('❌ Seed failed:');
      console.error(err && (err as any).stack ? (err as any).stack : err);
      console.error('\nTip: verify your database is running and DB env vars (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME) are set.');
      process.exitCode = 1;
    } finally {
      try {
        await dataSource.destroy();
      } catch (e) {
     
      }
    }
  })();
}
