import { Controller, Get, Patch, Put, Delete, UseGuards, Param, Body, Query } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@UseGuards(AdminGuard)
@Controller('admin/dashboard')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get all potholes with optional filtering
   * Query params: status, severity, district
   */
  @Get('potholes')
  getPotholes(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('district') district?: string,
  ) {
    return this.adminService.getPotholes({ status, severity, district });
  }

  /**
   * Get single pothole details with photos and reporter info
   */
  @Get('potholes/:id')
  getPotholeDetails(@Param('id') id: string) {
    return this.adminService.getPotholeDetails(parseInt(id, 10));
  }

  /**
   * Get all photos for a pothole
   */
  @Get('potholes/:id/photos')
  getPotholePhotos(@Param('id') id: string) {
    return this.adminService.getPotholePhotos(parseInt(id, 10));
  }

  /**
   * Delete a pothole
   */
  @Delete('potholes/:id')
  deletePothole(@Param('id') id: string) {
    return this.adminService.deletePothole(parseInt(id, 10));
  }

  /**
   * Update pothole status
   * Body: { status: 'Pending' | 'In Progress' | 'Resolved', notes?: string }
   */
  @Patch('potholes/:id')
  updatePotholeStatusPatch(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.adminService.updatePotholeStatus(parseInt(id, 10), body);
  }

  /**
   * Update pothole status (PUT alias for PATCH)
   * Body: { status: 'Pending' | 'In Progress' | 'Resolved', notes?: string }
   */
  @Put('potholes/:id')
  updatePotholeStatusPut(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.adminService.updatePotholeStatus(parseInt(id, 10), body);
  }

  /**
   * Get dashboard stats: counts by status, severity distribution
   */
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
}
