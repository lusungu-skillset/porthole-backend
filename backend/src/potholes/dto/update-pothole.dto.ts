import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePotholeDto {
  @IsOptional()
  @IsIn(['Pending', 'Verified', 'Fixed'])
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
