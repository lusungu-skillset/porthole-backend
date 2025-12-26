import { Controller, Get, Patch, Put, Delete, UseGuards, Param, Body, Query } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@UseGuards(AdminGuard)
@Controller('admin/dashboard')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  @Get('potholes')
  getPotholes(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('district') district?: string,
  ) {
    return this.adminService.getPotholes({ status, severity, district });
  }

  @Get('potholes/:id')
  getPotholeDetails(@Param('id') id: string) {
    return this.adminService.getPotholeDetails(parseInt(id, 10));
  }

 
  @Get('potholes/:id/photos')
  getPotholePhotos(@Param('id') id: string) {
    return this.adminService.getPotholePhotos(parseInt(id, 10));
  }

  
  @Delete('potholes/:id')
  deletePothole(@Param('id') id: string) {
    return this.adminService.deletePothole(parseInt(id, 10));
  }


  @Patch('potholes/:id')
  updatePotholeStatusPatch(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.adminService.updatePotholeStatus(parseInt(id, 10), body);
  }


  @Put('potholes/:id')
  updatePotholeStatusPut(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.adminService.updatePotholeStatus(parseInt(id, 10), body);
  }


  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
}
