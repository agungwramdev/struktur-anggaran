import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Rup31MaretService } from './rup-31-maret.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('rup-31-maret')
@ApiBearerAuth('JWT-auth')
@Controller('rup-31-maret')
@UseGuards(JwtAuthGuard, RolesGuard)
export class Rup31MaretController {
  constructor(private readonly rup31MaretService: Rup31MaretService) {}

  @Post('generate')
  @Roles('superadmin')
  @ApiOperation({ summary: 'Manually trigger RUP 31 Maret data generation' })
  @ApiResponse({ status: 201, description: 'Data generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateData() {
    const data = await this.rup31MaretService.generateExport();
    return {
      message: 'Data RUP 31 Maret berhasil di-generate',
      total_records: data.length,
    };
  }

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get RUP 31 Maret combined data' })
  @ApiResponse({ status: 200, description: 'Returns RUP combined data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getData() {
    return this.rup31MaretService.generateExport();
  }
}
