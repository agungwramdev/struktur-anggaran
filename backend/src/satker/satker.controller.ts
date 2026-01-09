import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SatkerService, SatkerData } from './satker.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('satker')
@ApiBearerAuth('JWT-auth')
@Controller('satker')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SatkerController {
  constructor(private readonly satkerService: SatkerService) {}

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get all satker data from external API' })
  @ApiQuery({ name: 'tahun', required: false, description: 'Year to fetch data for', example: 2025 })
  @ApiResponse({ status: 200, description: 'Returns satker data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Failed to fetch satker data' })
  async getSatkerData(@Query('tahun') tahun: string): Promise<SatkerData[]> {
    const year = tahun ? parseInt(tahun) : new Date().getFullYear();
    return this.satkerService.fetchSatkerData(year);
  }

  @Get(':kdSatker')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get satker by code' })
  @ApiParam({ name: 'kdSatker', description: 'Satker code', example: '123456' })
  @ApiQuery({ name: 'tahun', required: false, description: 'Year to fetch data for', example: 2025 })
  @ApiResponse({ status: 200, description: 'Returns satker data' })
  @ApiResponse({ status: 404, description: 'Satker not found' })
  async getSatkerByKode(@Param('kdSatker') kdSatker: string, @Query('tahun') tahun: string): Promise<SatkerData | null> {
    const year = tahun ? parseInt(tahun) : new Date().getFullYear();
    return this.satkerService.getSatkerByKode(year, kdSatker);
  }
}
