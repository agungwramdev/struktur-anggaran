import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStrukturAnggaranDto {
  @IsNumber()
  @IsOptional()
  tahun_anggaran?: number;

  @IsString()
  @IsOptional()
  kd_klpd?: string;

  @IsString()
  @IsOptional()
  nama_klpd?: string;

  @IsString()
  @IsOptional()
  kd_satker?: string;

  @IsString()
  @IsOptional()
  kd_satker_str?: string;

  @IsString()
  @IsOptional()
  nama_satker?: string;

  @IsNumber()
  @IsOptional()
  belanja_operasi?: number;

  @IsNumber()
  @IsOptional()
  belanja_modal?: number;

  @IsNumber()
  @IsOptional()
  belanja_btt?: number;

  @IsNumber()
  @IsOptional()
  belanja_non_pengadaan?: number;

  @IsNumber()
  @IsOptional()
  belanja_pengadaan?: number;

  @IsNumber()
  @IsOptional()
  total_belanja?: number;

  @IsNumber()
  @IsOptional()
  tahun?: number;
}
