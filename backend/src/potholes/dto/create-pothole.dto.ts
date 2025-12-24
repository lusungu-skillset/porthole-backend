import { IsNumber, IsOptional, IsString, Length, Max, Min, IsIn, IsObject } from 'class-validator';

// Frontend may send either plain latitude/longitude OR a GeoJSON geometry object.
// We accept both and handle creation accordingly in the service using PostGIS.
export class CreatePotholeDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsString()
  @Length(5, 2000)
  description!: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  roadName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  district?: string;

  @IsString()
  @Length(1, 120)
  @IsOptional()
  reporterName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  // Some frontends use `name` instead of `reporterName`.
  name?: string;
  @IsOptional()
  @IsString()
  // Accept severity as a string and normalize in the controller (LOW/MEDIUM/HIGH)
  severity?: string;

  @IsOptional()
  @IsObject()
  // GeoJSON geometry object (Point, Polygon, LineString, etc.). If provided,
  // the backend will use this geometry to set the PostGIS `geom` column
  // instead of using `latitude`/`longitude`.
  geometry?: Record<string, any>;

  @IsOptional()
  @IsObject()
  // Optional context geometry (GeoJSON) the frontend can send (for example a
  // road polyline). When provided the backend will compute `ST_ClosestPoint`
  // and `ST_Distance` between the stored pothole point and this geometry and
  // include those values in the response.
  contextGeometry?: Record<string, any>;

}
