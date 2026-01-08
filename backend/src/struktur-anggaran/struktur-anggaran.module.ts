import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StrukturAnggaranService } from './struktur-anggaran.service';
import { StrukturAnggaranController } from './struktur-anggaran.controller';
import { StrukturAnggaran, StrukturAnggaranSchema } from '../schemas/struktur-anggaran.schema';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StrukturAnggaran.name, schema: StrukturAnggaranSchema }]),
    LogsModule,
  ],
  controllers: [StrukturAnggaranController],
  providers: [StrukturAnggaranService],
})
export class StrukturAnggaranModule {}
