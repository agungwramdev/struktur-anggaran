import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as parquet from 'parquetjs';
import * as ExcelJS from 'exceljs';

interface RupPenyediaRecord {
  nama_satker: string;
  pagu: number;
  volume_pekerjaan: any;
}

interface RupSwakelolaRecord {
  nama_satker: string;
  pagu: number;
  volume_pekerjaan: any;
}

interface RupStrukturAnggaranRecord {
  nama_satker: string;
  belanja_pengadaan: number;
  belanja_operasi: number;
  belanja_non_pengadaan: number;
  belanja_modal: number;
  total_belanja: number;
}

export interface RupCombinedRecord {
  nama_satker: string;
  rup_penyedia: number;
  total_paket_penyedia: number;
  rup_swakelola: number;
  total_paket_swakelola: number;
  belanja_pengadaan: number;
  belanja_operasi: number;
  belanja_non_pengadaan: number;
  belanja_modal: number;
  total_belanja: number;
  total_rup: number;
  selisih: number;
  total_paket: number;
  persen: string;
}

@Injectable()
export class Rup31MaretService implements OnModuleInit {
  private readonly exportBasePath = process.env.EXPORT_PATH || '/data/exports';
  private readonly exportDir = 'rup-31-maret';

  private readonly exportFields = [
    'nama_satker',
    'rup_penyedia',
    'total_paket_penyedia',
    'rup_swakelola',
    'total_paket_swakelola',
    'belanja_pengadaan',
    'belanja_operasi',
    'belanja_non_pengadaan',
    'belanja_modal',
    'total_belanja',
    'total_rup',
    'selisih',
    'total_paket',
    'persen',
  ];

  private readonly fieldLabels: Record<string, string> = {
    nama_satker: 'Nama Satker',
    rup_penyedia: 'RUP Penyedia',
    total_paket_penyedia: 'Total Paket Penyedia',
    rup_swakelola: 'RUP Swakelola',
    total_paket_swakelola: 'Total Paket Swakelola',
    belanja_pengadaan: 'Belanja Pengadaan',
    belanja_operasi: 'Belanja Operasi',
    belanja_non_pengadaan: 'Belanja Non-Pengadaan',
    belanja_modal: 'Belanja Modal',
    total_belanja: 'Total Belanja',
    total_rup: 'Total RUP',
    selisih: 'Selisih',
    total_paket: 'Total Paket',
    persen: 'Persen',
  };

  private readonly urls = {
    penyedia: 'https://data.pbj.my.id/inaproc/rup/D197/RUP-Penyedia-Terumumkan/2026/data.json',
    swakelola: 'https://data.pbj.my.id/inaproc/rup/D197/RUP-Swakelola-Terumumkan/2026/data.json',
    strukturAnggaran: 'https://data.pbj.my.id/inaproc/rup/D197/RUP-Struktur-Anggaran-PD-Legacy/2026/data.json',
  };

  async onModuleInit() {
    try {
      console.log('[RUP-31-Maret] Generating initial export on startup...');
      await this.generateExport();
    } catch (err) {
      console.error('[RUP-31-Maret] Failed during initial export:', err.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyCron() {
    console.log('[RUP-31-Maret] Running daily scheduled export...');
    try {
      await this.generateExport();
      console.log('[RUP-31-Maret] Daily scheduled export completed successfully');
    } catch (err) {
      console.error('[RUP-31-Maret] Daily scheduled export failed:', err.message);
    }
  }

  async generateExport(): Promise<RupCombinedRecord[]> {
    const authConfig = {
      auth: {
        username: process.env.PBJ_API_USERNAME || 'admin',
        password: process.env.PBJ_API_PASSWORD || 'tetapsemangat',
      },
      timeout: 60000,
    };

    console.log('[RUP-31-Maret] Fetching data from external APIs...');

    // Fetch all 3 data sources in parallel
    const [resPenyedia, resSwakelola, resStrukturAnggaran] = await Promise.all([
      axios.get<RupPenyediaRecord[]>(this.urls.penyedia, authConfig),
      axios.get<RupSwakelolaRecord[]>(this.urls.swakelola, authConfig),
      axios.get<RupStrukturAnggaranRecord[]>(this.urls.strukturAnggaran, authConfig),
    ]);

    const rupPpt: RupPenyediaRecord[] = resPenyedia.data;
    const rupPwk: RupSwakelolaRecord[] = resSwakelola.data;
    const rupSa: RupStrukturAnggaranRecord[] = resStrukturAnggaran.data;

    console.log(`[RUP-31-Maret] Data fetched - Penyedia: ${rupPpt.length}, Swakelola: ${rupPwk.length}, Struktur Anggaran: ${rupSa.length}`);

    // GROUP BY nama_satker untuk penyedia: SUM(pagu) dan COUNT(volume_pekerjaan)
    const penyediaMap = new Map<string, { rup_penyedia: number; total_paket_penyedia: number }>();
    for (const row of rupPpt) {
      const key = row.nama_satker;
      const existing = penyediaMap.get(key);
      if (existing) {
        existing.rup_penyedia += Number(row.pagu) || 0;
        existing.total_paket_penyedia += 1;
      } else {
        penyediaMap.set(key, {
          rup_penyedia: Number(row.pagu) || 0,
          total_paket_penyedia: 1,
        });
      }
    }

    // GROUP BY nama_satker untuk swakelola: SUM(pagu) dan COUNT(volume_pekerjaan)
    const swakelolaMap = new Map<string, { rup_swakelola: number; total_paket_swakelola: number }>();
    for (const row of rupPwk) {
      const key = row.nama_satker;
      const existing = swakelolaMap.get(key);
      if (existing) {
        existing.rup_swakelola += Number(row.pagu) || 0;
        existing.total_paket_swakelola += 1;
      } else {
        swakelolaMap.set(key, {
          rup_swakelola: Number(row.pagu) || 0,
          total_paket_swakelola: 1,
        });
      }
    }

    // Struktur Anggaran sebagai map
    const saMap = new Map<string, RupStrukturAnggaranRecord>();
    for (const row of rupSa) {
      saMap.set(row.nama_satker, row);
    }

    // Inner join: hanya satker yang ada di ketiga dataset
    const allSatkerNames = new Set<string>();
    for (const key of penyediaMap.keys()) {
      if (swakelolaMap.has(key) && saMap.has(key)) {
        allSatkerNames.add(key);
      }
    }

    // Merge dan hitung
    const combined: RupCombinedRecord[] = [];
    for (const namaSatker of allSatkerNames) {
      const penyedia = penyediaMap.get(namaSatker);
      const swakelola = swakelolaMap.get(namaSatker);
      const sa = saMap.get(namaSatker);

      const totalRup = penyedia.rup_penyedia + swakelola.rup_swakelola;
      const belanjaPengadaan = Number(sa.belanja_pengadaan) || 0;
      const persen = belanjaPengadaan !== 0
        ? `${Math.round((totalRup / belanjaPengadaan) * 100 * 100) / 100}%`
        : '0%';

      combined.push({
        nama_satker: namaSatker,
        rup_penyedia: penyedia.rup_penyedia,
        total_paket_penyedia: penyedia.total_paket_penyedia,
        rup_swakelola: swakelola.rup_swakelola,
        total_paket_swakelola: swakelola.total_paket_swakelola,
        belanja_pengadaan: belanjaPengadaan,
        belanja_operasi: Number(sa.belanja_operasi) || 0,
        belanja_non_pengadaan: Number(sa.belanja_non_pengadaan) || 0,
        belanja_modal: Number(sa.belanja_modal) || 0,
        total_belanja: Number(sa.total_belanja) || 0,
        total_rup: totalRup,
        selisih: belanjaPengadaan - totalRup,
        total_paket: penyedia.total_paket_penyedia + swakelola.total_paket_swakelola,
        persen,
      });
    }

    // Sort by nama_satker
    combined.sort((a, b) => a.nama_satker.localeCompare(b.nama_satker));

    // Write to export files (JSON, XLSX, Parquet)
    const dirPath = path.join(this.exportBasePath, this.exportDir);
    await fs.mkdir(dirPath, { recursive: true });

    await Promise.all([
      this.generateJson(dirPath, combined),
      this.generateXlsx(dirPath, combined),
      this.generateParquet(dirPath, combined),
    ]);

    console.log(`[RUP-31-Maret] Export saved to ${dirPath} (${combined.length} records) - JSON, XLSX, Parquet`);
    return combined;
  }

  private async generateJson(dirPath: string, data: RupCombinedRecord[]): Promise<void> {
    const filePath = path.join(dirPath, 'data.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async generateXlsx(dirPath: string, data: RupCombinedRecord[]): Promise<void> {
    const filePath = path.join(dirPath, 'data.xlsx');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Struktur Anggaran App';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('RUP 31 Maret');

    sheet.columns = this.exportFields.map((field) => ({
      header: this.fieldLabels[field] || field,
      key: field,
      width: field === 'nama_satker' ? 40 : field === 'persen' ? 12 : 20,
    }));

    // Style header row
    const headerRow = sheet.getRow(1);
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
      'rup_penyedia',
      'rup_swakelola',
      'belanja_pengadaan',
      'belanja_operasi',
      'belanja_non_pengadaan',
      'belanja_modal',
      'total_belanja',
      'total_rup',
      'selisih',
    ];
    for (const field of currencyFields) {
      const colIndex = this.exportFields.indexOf(field) + 1;
      if (colIndex > 0) {
        sheet.getColumn(colIndex).numFmt = '#,##0';
      }
    }

    await workbook.xlsx.writeFile(filePath);
  }

  private async generateParquet(dirPath: string, data: RupCombinedRecord[]): Promise<void> {
    const filePath = path.join(dirPath, 'data.parquet');

    const schema = new parquet.ParquetSchema({
      nama_satker: { type: 'UTF8' },
      rup_penyedia: { type: 'INT64' },
      total_paket_penyedia: { type: 'INT64' },
      rup_swakelola: { type: 'INT64' },
      total_paket_swakelola: { type: 'INT64' },
      belanja_pengadaan: { type: 'INT64' },
      belanja_operasi: { type: 'INT64' },
      belanja_non_pengadaan: { type: 'INT64' },
      belanja_modal: { type: 'INT64' },
      total_belanja: { type: 'INT64' },
      total_rup: { type: 'INT64' },
      selisih: { type: 'INT64' },
      total_paket: { type: 'INT64' },
      persen: { type: 'UTF8' },
    });

    const writer = await parquet.ParquetWriter.openFile(schema, filePath);

    for (const row of data) {
      await writer.appendRow(row);
    }

    await writer.close();
  }
}
