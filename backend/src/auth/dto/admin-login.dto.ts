import { IsEmail, IsString, Length } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 255)
  password!: string;
}
