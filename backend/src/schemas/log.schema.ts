import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LogDocument = Log & Document;

@Schema({ timestamps: true, collection: 'logs' })
export class Log {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  aktifitas: string;

  @Prop()
  keterangan: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.index({ user_id: 1, createdAt: -1 });
