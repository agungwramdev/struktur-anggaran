import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StrukturAnggaranService } from './struktur-anggaran.service';
import { CreateStrukturAnggaranDto } from '../dto/create-struktur-anggaran.dto';
import { UpdateStrukturAnggaranDto } from '../dto/update-struktur-anggaran.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('struktur-anggaran')
@ApiBearerAuth('JWT-auth')
@Controller('struktur-anggaran')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StrukturAnggaranController {
  constructor(private readonly strukturAnggaranService: StrukturAnggaranService) {}

  @Post()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Create new struktur anggaran' })
  @ApiResponse({ status: 201, description: 'Struktur anggaran created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createStrukturAnggaranDto: CreateStrukturAnggaranDto, @Request() req) {
    return this.strukturAnggaranService.create(createStrukturAnggaranDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get all struktur anggaran' })
  @ApiQuery({ name: 'tahun', required: false, description: 'Filter by year' })
  @ApiResponse({ status: 200, description: 'Returns all struktur anggaran' })
  findAll(@Query('tahun') tahun?: string) {
    if (tahun) {
      return this.strukturAnggaranService.findByTahun(parseInt(tahun));
    }
    return this.strukturAnggaranService.findAll();
  }

  @Get('statistics')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get budget statistics' })
  @ApiQuery({ name: 'tahun', required: false, description: 'Filter by year' })
  @ApiResponse({ status: 200, description: 'Returns budget statistics' })
  getStatistics(@Query('tahun') tahun?: string) {
    if (tahun) {
      return this.strukturAnggaranService.getStatistics(parseInt(tahun));
    }
    return this.strukturAnggaranService.getStatistics();
  }

  @Get('used-satker')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get list of satker codes that already have data for a year' })
  @ApiQuery({ name: 'tahun', required: true, description: 'Year to check' })
  @ApiResponse({ status: 200, description: 'Returns array of used satker codes' })
  getUsedSatker(@Query('tahun') tahun: string) {
    return this.strukturAnggaranService.getUsedSatkerCodes(parseInt(tahun));
  }

  @Get('satker/:kdSatker')
  @Roles('admin', 'superadmin')
  findBySatker(@Param('kdSatker') kdSatker: string, @Query('tahun') tahun?: string) {
    if (tahun) {
      return this.strukturAnggaranService.findBySatker(kdSatker, parseInt(tahun));
    }
    return this.strukturAnggaranService.findBySatker(kdSatker);
  }

  @Get(':id')
  @Roles('admin', 'superadmin')
  findOne(@Param('id') id: string) {
    return this.strukturAnggaranService.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'superadmin')
  update(
    @Param('id') id: string,
    @Body() updateStrukturAnggaranDto: UpdateStrukturAnggaranDto,
    @Request() req,
  ) {
    return this.strukturAnggaranService.update(id, updateStrukturAnggaranDto, req.user.userId);
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  remove(@Param('id') id: string, @Request() req) {
    return this.strukturAnggaranService.remove(id, req.user.userId);
  }
}
