import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StrukturAnggaran, StrukturAnggaranDocument } from '../schemas/struktur-anggaran.schema';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as parquet from 'parquetjs';
import * as ExcelJS from 'exceljs';

@Injectable()
export class FileExportService implements OnModuleInit {
  private readonly exportBasePath = process.env.EXPORT_PATH || '/data/exports';
  private pendingExports = new Map<number, NodeJS.Timeout>();

  private readonly exportFields = [
    'tahun_anggaran',
    'kd_klpd',
    'nama_klpd',
    'kd_satker',
    'kd_satker_str',
    'nama_satker',
    'belanja_operasi',
    'belanja_modal',
    'belanja_bbt',
    'belanja_non_pengadaan',
    'belanja_pengadaan',
    'total_belanja',
    'tahun',
  ];

  private readonly fieldLabels: Record<string, string> = {
    tahun_anggaran: 'Tahun Anggaran',
    kd_klpd: 'Kode KLPD',
    nama_klpd: 'Nama KLPD',
    kd_satker: 'Kode Satker',
    kd_satker_str: 'Kode Satker (String)',
    nama_satker: 'Nama Satker',
    belanja_operasi: 'Belanja Operasi',
    belanja_modal: 'Belanja Modal',
    belanja_bbt: 'Belanja BBT',
    belanja_non_pengadaan: 'Belanja Non-Pengadaan',
    belanja_pengadaan: 'Belanja Pengadaan',
    total_belanja: 'Total Belanja',
    tahun: 'Tahun',
  };

  constructor(
    @InjectModel(StrukturAnggaran.name)
    private strukturAnggaranModel: Model<StrukturAnggaranDocument>,
  ) {}

  async onModuleInit() {
    try {
      // Ambil tahun yang ada di database + tahun sekarang
      const dbYears = await this.strukturAnggaranModel.distinct('tahun_anggaran').exec();
      const currentYear = new Date().getFullYear();
      const years = [...new Set([...dbYears, currentYear])].sort();

      console.log(`[FileExport] Generating initial exports for years: ${years.join(', ')}`);
      for (const year of years) {
        await this.generateExports(year);
      }
      console.log('[FileExport] Initial export generation complete');
    } catch (err) {
      console.error('[FileExport] Failed during initial export:', err.message);
    }
  }

  scheduleExport(tahunAnggaran: number): void {
    const existing = this.pendingExports.get(tahunAnggaran);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(async () => {
      this.pendingExports.delete(tahunAnggaran);
      try {
        await this.generateExports(tahunAnggaran);
        console.log(`[FileExport] Successfully generated exports for year ${tahunAnggaran}`);
      } catch (err) {
        console.error(`[FileExport] Failed to generate exports for year ${tahunAnggaran}:`, err.message);
      }
    }, 2000);

    this.pendingExports.set(tahunAnggaran, timeout);
  }

  async generateExports(tahunAnggaran: number): Promise<void> {
    const data = await this.strukturAnggaranModel
      .find({ tahun_anggaran: tahunAnggaran })
      .sort({ nama_satker: 1 })
      .lean()
      .exec();

    const dirPath = path.join(this.exportBasePath, 'struktur-anggaran', String(tahunAnggaran));
    await fs.mkdir(dirPath, { recursive: true });

    const cleanData = data.map((doc) => {
      const clean: Record<string, any> = {};
      for (const field of this.exportFields) {
        clean[field] = doc[field];
      }
      return clean;
    });

    await Promise.all([
      this.generateJson(dirPath, cleanData),
      this.generateXlsx(dirPath, cleanData),
      this.generateParquet(dirPath, cleanData),
    ]);
  }

  private async generateJson(dirPath: string, data: Record<string, any>[]): Promise<void> {
    const filePath = path.join(dirPath, 'data.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async generateXlsx(dirPath: string, data: Record<string, any>[]): Promise<void> {
    const filePath = path.join(dirPath, 'data.xlsx');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Struktur Anggaran App';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Struktur Anggaran');

    sheet.columns = this.exportFields.map((field) => ({
      header: this.fieldLabels[field] || field,
      key: field,
      width: field.startsWith('nama_') ? 40 : field.startsWith('belanja_') || field === 'total_belanja' ? 20 : 18,
    }));

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    for (const row of data) {
      sheet.addRow(row);
    }

    // Format currency columns
    const currencyFields = [
      'belanja_operasi',
      'belanja_modal',
      'belanja_bbt',
      'belanja_non_pengadaan',
      'belanja_pengadaan',
      'total_belanja',
    ];
    for (const field of currencyFields) {
      const colIndex = this.exportFields.indexOf(field) + 1;
      if (colIndex > 0) {
        sheet.getColumn(colIndex).numFmt = '#,##0';
      }
    }

    await workbook.xlsx.writeFile(filePath);
  }

  private async generateParquet(dirPath: string, data: Record<string, any>[]): Promise<void> {
    const filePath = path.join(dirPath, 'data.parquet');

    const schema = new parquet.ParquetSchema({
      tahun_anggaran: { type: 'INT64' },
      kd_klpd: { type: 'UTF8' },
      nama_klpd: { type: 'UTF8' },
      kd_satker: { type: 'UTF8' },
      kd_satker_str: { type: 'UTF8' },
      nama_satker: { type: 'UTF8' },
      belanja_operasi: { type: 'INT64' },
      belanja_modal: { type: 'INT64' },
      belanja_bbt: { type: 'INT64' },
      belanja_non_pengadaan: { type: 'INT64' },
      belanja_pengadaan: { type: 'INT64' },
      total_belanja: { type: 'INT64' },
      tahun: { type: 'INT64' },
    });

    const writer = await parquet.ParquetWriter.openFile(schema, filePath);

    for (const row of data) {
      await writer.appendRow(row);
    }

    await writer.close();
  }
}
