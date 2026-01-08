import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  nama?: string;

  @IsEnum(['admin', 'superadmin'])
  @IsOptional()
  role?: string;

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;
}
