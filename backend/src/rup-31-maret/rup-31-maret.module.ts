import { Module } from '@nestjs/common';
import { Rup31MaretService } from './rup-31-maret.service';
import { Rup31MaretController } from './rup-31-maret.controller';

@Module({
  controllers: [Rup31MaretController],
  providers: [Rup31MaretService],
  exports: [Rup31MaretService],
})
export class Rup31MaretModule {}
