import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * ADMIN LOGIN
   * Returns JWT token + admin info
   */
  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.authService.login(dto);
  }

  /**
   * TOKEN VERIFICATION
   * Used by frontend to check if admin is still logged in
   */
  @Get('verify')
  async verifyToken(@Headers('authorization') authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.slice(7);

    try {
      // Verify JWT signature & expiry
      const payload = this.jwtService.verify(token);

      // Optional: load admin from DB (extra safety)
      const admin = await this.authService.validateJwtPayload(payload);

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Admin not found or inactive');
      }

      // Never return password
      const { password, ...adminData } = admin;

      return {
        valid: true,
        admin: adminData,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
