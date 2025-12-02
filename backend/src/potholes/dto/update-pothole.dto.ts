import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePotholeDto {
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsIn(['Pending', 'In Progress', 'Fixed'])
  status?: 'Pending' | 'In Progress' | 'Fixed';

  @IsOptional()
  @IsString()
  description?: string;
}
