import { Controller, Post, Body, UseGuards, Get, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.authService.login(dto);
  }

  @Get('verify')
  async verifyToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, message: 'Missing or invalid token' };
    }

    const token = authHeader.substring(7); 
    const admin = await this.authService.validateToken(token);

    if (!admin) {
      return { valid: false, message: 'Invalid token' };
    }

    const { password, ...adminData } = admin;
    return { valid: true, admin: adminData };
  }
}
