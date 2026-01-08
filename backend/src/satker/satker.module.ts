import { Module } from '@nestjs/common';
import { SatkerService } from './satker.service';
import { SatkerController } from './satker.controller';

@Module({
  controllers: [SatkerController],
  providers: [SatkerService],
  exports: [SatkerService],
})
export class SatkerModule {}
