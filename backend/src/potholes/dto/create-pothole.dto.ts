import { IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

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

  @IsString()
  @Length(1, 120)
  reporterName!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
