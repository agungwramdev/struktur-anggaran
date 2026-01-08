import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SatkerService, SatkerData } from './satker.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('satker')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SatkerController {
  constructor(private readonly satkerService: SatkerService) {}

  @Get()
  @Roles('admin', 'superadmin')
  async getSatkerData(@Query('tahun') tahun: string): Promise<SatkerData[]> {
    const year = tahun ? parseInt(tahun) : new Date().getFullYear();
    return this.satkerService.fetchSatkerData(year);
  }

  @Get(':kdSatker')
  @Roles('admin', 'superadmin')
  async getSatkerByKode(@Param('kdSatker') kdSatker: string, @Query('tahun') tahun: string): Promise<SatkerData | null> {
    const year = tahun ? parseInt(tahun) : new Date().getFullYear();
    return this.satkerService.getSatkerByKode(year, kdSatker);
  }
}
