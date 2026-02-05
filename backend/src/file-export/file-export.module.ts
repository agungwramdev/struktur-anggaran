import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileExportService } from './file-export.service';
import { StrukturAnggaran, StrukturAnggaranSchema } from '../schemas/struktur-anggaran.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StrukturAnggaran.name, schema: StrukturAnggaranSchema },
    ]),
  ],
  providers: [FileExportService],
  exports: [FileExportService],
})
export class FileExportModule {}
