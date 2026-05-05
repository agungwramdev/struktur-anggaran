import {
  Controller,
  Get,
  Post,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { KioskService } from './kiosk.service';

@ApiTags('kiosk')
@SkipThrottle()
@Controller('kiosk')
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

  private currentYear() {
    return new Date().getFullYear();
  }

  @Post('compute-rup')
  @ApiOperation({ summary: 'Fetch RUP data from external API and save to file' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 201, description: 'RUP data computed and saved' })
  async computeRup(@Query('year') year?: number) {
    const y = Number(year) || this.currentYear();
    try {
      const result = await this.kioskService.computeRup(y);
      return {
        status: 'ok',
        preview: {
          tahun: result.tahun,
          total_rup: result.total_rup,
          persen: result.persen,
          _generated_at: result._generated_at,
        },
      };
    } catch (err) {
      throw new HttpException(
        `Gagal compute RUP: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('rup')
  @ApiOperation({ summary: 'Get cached RUP summary from file' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'RUP summary data' })
  @ApiResponse({ status: 404, description: 'File belum ada, jalankan compute-rup dulu' })
  async getKioskRup(@Query('year') year?: number) {
    const y = Number(year) || this.currentYear();
    try {
      const data = await this.kioskService.getKioskRup(y);
      return { status: 'ok', source: 'file', data };
    } catch (err) {
      const status = err.message.includes('belum ada')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(err.message, status);
    }
  }

  @Get('tender')
  @ApiOperation({ summary: 'Get tender summary from external API' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tender summary data' })
  async getKioskTender(@Query('year') year?: number) {
    const y = Number(year) || this.currentYear();
    try {
      const data = await this.kioskService.getKioskTender(y);
      return { status: 'ok', data };
    } catch (err) {
      throw new HttpException(
        `Gagal ambil data tender: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
