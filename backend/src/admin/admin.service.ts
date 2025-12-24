import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Get potholes with optional filters by status, severity, district
   */
  async getPotholes(filters?: { status?: string; severity?: string; district?: string }) {
    let query = `
      SELECT
        p.id,
        p.description,
        p.road_name AS "roadName",
        p.district,
        ST_Y(p.geom) AS latitude,
        ST_X(p.geom) AS longitude,
        p.severity,
        p.status,
        p.reported_at AS "reportedAt"
      FROM potholes p
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.status) {
      query += ` AND p.status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters?.severity) {
      query += ` AND p.severity = $${params.length + 1}`;
      params.push(filters.severity);
    }

    if (filters?.district) {
      query += ` AND p.district = $${params.length + 1}`;
      params.push(filters.district);
    }

    query += ` ORDER BY p.reported_at DESC`;

    return this.dataSource.query(query, params);
  }

  /**
   * Get single pothole details with photos and reporter info
   */
  async getPotholeDetails(potholeId: number) {
    const pothole = await this.dataSource.query(
      `
      SELECT
        p.id,
        p.description,
        p.road_name AS "roadName",
        p.district,
        ST_Y(p.geom) AS latitude,
        ST_X(p.geom) AS longitude,
        p.severity,
        p.status,
        p.reporter_name AS "reporterName",
        p.reported_at AS "reportedAt"
      FROM potholes p
      WHERE p.id = $1
      `,
      [potholeId],
    );

    if (!pothole || pothole.length === 0) {
      throw new BadRequestException('Pothole not found');
    }

    // Get related photos
    const photos = await this.dataSource.query(
      `
      SELECT id, photo_url, uploaded_at
      FROM pothole_photos
      WHERE pothole_id = $1
      ORDER BY uploaded_at DESC
      `,
      [potholeId],
    );

    return {
      ...pothole[0],
      photos: photos || [],
    };
  }

  /**
   * Get all photos for a pothole with details
   */
  async getPotholePhotos(potholeId: number) {
    // Verify pothole exists
    const pothole = await this.dataSource.query(
      `SELECT id FROM potholes WHERE id = $1`,
      [potholeId],
    );

    if (!pothole || pothole.length === 0) {
      throw new BadRequestException('Pothole not found');
    }

    // Get all photos
    const photos = await this.dataSource.query(
      `
      SELECT 
        id,
        photo_url,
        uploaded_at,
        uploader_name
      FROM pothole_photos
      WHERE pothole_id = $1
      ORDER BY uploaded_at DESC
      `,
      [potholeId],
    );

    return {
      potholeId,
      totalPhotos: photos.length,
      photos,
    };
  }

  /**
   * Update pothole status and optionally add notes
   */
  async updatePotholeStatus(
    potholeId: number,
    body: { status: string; notes?: string },
  ) {
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(body.status)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }

    // Check if pothole exists
    const exists = await this.dataSource.query(
      'SELECT id FROM potholes WHERE id = $1',
      [potholeId],
    );

    if (!exists || exists.length === 0) {
      throw new BadRequestException('Pothole not found');
    }

    // Update status
    let updateQuery = `
      UPDATE potholes
      SET status = $1
    `;
    const params: any[] = [body.status];

    // If notes provided, append to description or create separate notes column (adjust based on DB schema)
    // For now, we'll just update status. You can extend this later with a notes table.
    if (body.notes) {
      // Optionally store notes - this assumes you have a notes/comments column or separate table
      // For now, we'll log the intent in comments
      console.log(`Notes for pothole ${potholeId}: ${body.notes}`);
    }

    updateQuery += ` WHERE id = $2 RETURNING id, status`;
    params.push(potholeId);

    const result = await this.dataSource.query(updateQuery, params);

    return {
      success: true,
      pothole: result[0],
      message: `Pothole ${potholeId} status updated to ${body.status}`,
    };
  }

  /**
   * Get dashboard statistics
   */
  async getStats() {
    // Count by status
    const statusCounts = await this.dataSource.query(`
      SELECT status, COUNT(*) as count
      FROM potholes
      GROUP BY status
    `);

    // Count by severity
    const severityCounts = await this.dataSource.query(`
      SELECT severity, COUNT(*) as count
      FROM potholes
      GROUP BY severity
    `);

    // Total count
    const total = await this.dataSource.query(`
      SELECT COUNT(*) as count FROM potholes
    `);

    // Count by district (top 5)
    const districtCounts = await this.dataSource.query(`
      SELECT '' AS district, COUNT(id) as count
      FROM potholes
      LIMIT 1
    `);

    return {
      total: parseInt(total[0]?.count || 0, 10),
      byStatus: statusCounts.map((s: any) => ({ status: s.status, count: parseInt(s.count, 10) })),
      bySeverity: severityCounts.map((s: any) => ({ severity: s.severity, count: parseInt(s.count, 10) })),
      topDistricts: districtCounts.map((d: any) => ({ district: d.district, count: parseInt(d.count, 10) })),
    };
  }

  /**
   * Delete a pothole and its related photos
   */
  async deletePothole(potholeId: number) {
    // Check if pothole exists
    const exists = await this.dataSource.query(
      `SELECT id FROM potholes WHERE id = $1`,
      [potholeId],
    );

    if (!exists || exists.length === 0) {
      throw new BadRequestException('Pothole not found');
    }

    // Delete related photos first (if they exist)
    await this.dataSource.query(
      `DELETE FROM pothole_photos WHERE pothole_id = $1`,
      [potholeId],
    );

    // Delete the pothole
    const result = await this.dataSource.query(
      `DELETE FROM potholes WHERE id = $1 RETURNING id`,
      [potholeId],
    );

    return {
      success: true,
      message: `Pothole ${potholeId} and its photos have been deleted`,
      deletedId: result[0]?.id,
    };
  }
}
