import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>
  ) {}

  async login(dto: AdminLoginDto): Promise<{ token: string; admin: Admin }> {
    const admin = await this.adminRepo.findOneBy({ email: dto.email });

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Simple password comparison (in production, use bcrypt)
    if (admin.password !== dto.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${admin.id}:${admin.email}`).toString('base64');

    const { password, ...adminData } = admin;

    return {
      token,
      admin: adminData as unknown as Admin
    };
  }

  async validateToken(token: string): Promise<Admin | null> {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [adminId] = decoded.split(':');
      const id = parseInt(adminId, 10);
      if (isNaN(id)) {
        return null;
      }
      const admin = await this.adminRepo.findOne({ where: { id } });
      return admin || null;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }
}
