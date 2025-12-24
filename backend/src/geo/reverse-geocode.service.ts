import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReverseGeocodeService {
  private readonly logger = new Logger(ReverseGeocodeService.name);

  async getRoadName(lat: number, lon: number): Promise<string | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
      const res = await fetch(url, {
        headers: {
          // REQUIRED by Nominatim usage policy
          'User-Agent': 'PotholeReporter/1.0 (admin@yourdomain.com)',
        },
      });

      if (!res.ok) return null;

      const data = await res.json();

      return (
        data?.address?.road ||
        data?.address?.neighbourhood ||
        data?.address?.suburb ||
        data?.address?.village ||
        null
      );
    } catch (err) {
      this.logger.error('Reverse geocoding failed', err);
      return null;
    }
  }

  async getDistrict(lat: number, lon: number): Promise<string | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'PotholeReporter/1.0 (admin@yourdomain.com)',
        },
      });

      if (!res.ok) return null;

      const data = await res.json();

      return (
        data?.address?.county ||
        data?.address?.state ||
        data?.address?.province ||
        data?.address?.region ||
        null
      );
    } catch (err) {
      this.logger.error('District reverse geocoding failed', err);
      return null;
    }
  }
}
