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
import { StrukturAnggaranService } from './struktur-anggaran.service';
import { CreateStrukturAnggaranDto } from '../dto/create-struktur-anggaran.dto';
import { UpdateStrukturAnggaranDto } from '../dto/update-struktur-anggaran.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('struktur-anggaran')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StrukturAnggaranController {
  constructor(private readonly strukturAnggaranService: StrukturAnggaranService) {}

  @Post()
  @Roles('admin', 'superadmin')
  create(@Body() createStrukturAnggaranDto: CreateStrukturAnggaranDto, @Request() req) {
    return this.strukturAnggaranService.create(createStrukturAnggaranDto, req.user.userId);
  }

  @Get()
  @Roles('admin', 'superadmin')
  findAll(@Query('tahun') tahun?: string) {
    if (tahun) {
      return this.strukturAnggaranService.findByTahun(parseInt(tahun));
    }
    return this.strukturAnggaranService.findAll();
  }

  @Get('statistics')
  @Roles('admin', 'superadmin')
  getStatistics(@Query('tahun') tahun?: string) {
    if (tahun) {
      return this.strukturAnggaranService.getStatistics(parseInt(tahun));
    }
    return this.strukturAnggaranService.getStatistics();
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
