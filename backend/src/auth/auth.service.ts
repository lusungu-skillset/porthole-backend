import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: AdminLoginDto) {
    const admin = await this.adminRepo
      .createQueryBuilder('admin')
      .addSelect('admin.password')
      .where('admin.email = :email', { email: dto.email })
      .getOne();

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(dto.password, (admin as any).password);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: admin.id, email: admin.email, role: 'ADMIN' };
    const token = this.jwtService.sign(payload);

    const { password, ...adminData } = admin;

    return { token, admin: adminData };
  }

  // Used by guards to validate JWT
  async validateJwtPayload(payload: any) {
    const admin = await this.adminRepo.findOne({ where: { id: payload.sub } });
    return admin || null;
  }

  // Verify a raw token and return the admin (used by guards expecting token input)
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return await this.validateJwtPayload(payload);
    } catch (err) {
      return null;
    }
  }
}
