import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStrukturAnggaranDto {
  @IsNumber()
  @IsNotEmpty()
  tahun_anggaran: number;

  @IsString()
  @IsNotEmpty()
  kd_klpd: string;

  @IsString()
  @IsNotEmpty()
  nama_klpd: string;

  @IsString()
  @IsNotEmpty()
  kd_satker: string;

  @IsString()
  @IsNotEmpty()
  kd_satker_str: string;

  @IsString()
  @IsNotEmpty()
  nama_satker: string;

  @IsNumber()
  belanja_operasi: number;

  @IsNumber()
  belanja_modal: number;

  @IsNumber()
  belanja_bbt: number;

  @IsNumber()
  belanja_non_pengadaan: number;

  @IsNumber()
  belanja_pengadaan: number;

  @IsNumber()
  total_belanja: number;

  @IsNumber()
  @IsNotEmpty()
  tahun: number;
}
