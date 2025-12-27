import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReverseGeocodeService {
  private readonly logger = new Logger(ReverseGeocodeService.name);

  async getRoadName(lat: number, lon: number): Promise<string | null> {
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

  async getFullLocation(lat: number, lon: number): Promise<string | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'PotholeReporter/1.0 (admin@yourdomain.com)',
        },
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (!data?.address) return null;

      
      const addressParts = [
        data.address.road,
        data.address.neighbourhood,
        data.address.suburb,
        data.address.village,
        data.address.city,
        data.address.town,
        data.address.county,
        data.address.state,
        data.address.country
      ].filter(Boolean);

      return addressParts.join(', ');
    } catch (err) {
      this.logger.error('Full location reverse geocoding failed', err);
      return null;
    }
  }
}
