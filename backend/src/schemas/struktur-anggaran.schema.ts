import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StrukturAnggaranDocument = StrukturAnggaran & Document;

@Schema({ timestamps: true, collection: 'struktur-anggaran' })
export class StrukturAnggaran {
  @Prop({ required: true })
  tahun_anggaran: number;

  @Prop({ required: true })
  kd_klpd: string;

  @Prop({ required: true })
  nama_klpd: string;

  @Prop({ required: true })
  kd_satker: string;

  @Prop({ required: true })
  kd_satker_str: string;

  @Prop({ required: true })
  nama_satker: string;

  @Prop({ type: Number, default: 0 })
  belanja_operasi: number;

  @Prop({ type: Number, default: 0 })
  belanja_modal: number;

  @Prop({ type: Number, default: 0 })
  belanja_btt: number;

  @Prop({ type: Number, default: 0 })
  belanja_non_pengadaan: number;

  @Prop({ type: Number, default: 0 })
  belanja_pengadaan: number;

  @Prop({ type: Number, default: 0 })
  total_belanja: number;

  @Prop({ required: true })
  tahun: number;
}

export const StrukturAnggaranSchema = SchemaFactory.createForClass(StrukturAnggaran);

StrukturAnggaranSchema.index({ tahun_anggaran: 1, kd_satker: 1 });
