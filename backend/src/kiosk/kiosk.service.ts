import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

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

interface TenderRecord {
  status_tender?: string;
  pagu?: number;
  hps?: number;
}

export interface RupSummaryResult {
  nama_satker: string;
  tahun: number;
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
  _generated_at: string;
}

export interface TenderSummaryResult {
  satker: string;
  tahun: number;
  total_tender: number;
  total_pagu: number;
  total_hps: number;
  berlangsung: number;
  selesai: number;
  gagal_batal: number;
}

@Injectable()
export class KioskService implements OnModuleInit {
  private readonly exportBasePath = process.env.EXPORT_PATH || '/data/exports';
  private readonly filesDir = 'kiosk';

  private get authConfig() {
    return {
      auth: {
        username: process.env.PBJ_API_USERNAME || 'admin',
        password: process.env.PBJ_API_PASSWORD || 'tetapsemangat',
      },
      timeout: 60000,
    };
  }

  private rupUrl(year: number) {
    return {
      penyedia: `https://data.pbj.my.id/isb-v2/rup/D197/RUP-PaketPenyedia-Terumumkan/${year}/data.json`,
      swakelola: `https://data.pbj.my.id/isb-v2/rup/D197/RUP-PaketSwakelola-Terumumkan/${year}/data.json`,
      strukturAnggaran: `https://data.pbj.my.id/inaproc/rup/D197/RUP-Struktur-Anggaran-PD-Legacy/${year}/data.json`,
    };
  }

  private tenderUrl(year: number) {
    return `https://data.pbj.my.id/inaproc/tender/D197/Tender-Pengumuman/${year}/data.json`;
  }

  async onModuleInit() {
    try {
      console.log('[Kiosk] Generating initial RUP export on startup...');
      await this.computeRup(new Date().getFullYear());
    } catch (err) {
      console.error('[Kiosk] Failed during initial RUP export:', err.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyCron() {
    console.log('[Kiosk] Running daily RUP compute...');
    try {
      await this.computeRup(new Date().getFullYear());
      console.log('[Kiosk] Daily RUP compute completed');
    } catch (err) {
      console.error('[Kiosk] Daily RUP compute failed:', err.message);
    }
  }

  async computeRup(year: number): Promise<RupSummaryResult> {
    const urls = this.rupUrl(year);

    console.log(`[Kiosk] Fetching RUP data for year ${year}...`);

    const [resPenyedia, resSwakelola, resSa] = await Promise.all([
      axios.get<RupPenyediaRecord[]>(urls.penyedia, this.authConfig),
      axios.get<RupSwakelolaRecord[]>(urls.swakelola, this.authConfig),
      axios.get<RupStrukturAnggaranRecord[]>(urls.strukturAnggaran, this.authConfig),
    ]);

    const rupPpt: RupPenyediaRecord[] = resPenyedia.data;
    const rupPwk: RupSwakelolaRecord[] = resSwakelola.data;
    const rupSa: RupStrukturAnggaranRecord[] = resSa.data;

    console.log(
      `[Kiosk] Fetched - Penyedia: ${rupPpt.length}, Swakelola: ${rupPwk.length}, Struktur Anggaran: ${rupSa.length}`,
    );

    const rupPenyedia = rupPpt.reduce((sum, r) => sum + (Number(r.pagu) || 0), 0);
    const totalPaketPenyedia = rupPpt.length;

    const rupSwakelola = rupPwk.reduce((sum, r) => sum + (Number(r.pagu) || 0), 0);
    const totalPaketSwakelola = rupPwk.length;

    const belanjaPengadaan = rupSa.reduce((sum, r) => sum + (Number(r.belanja_pengadaan) || 0), 0);
    const belanjaOperasi = rupSa.reduce((sum, r) => sum + (Number(r.belanja_operasi) || 0), 0);
    const belanjaNonPengadaan = rupSa.reduce(
      (sum, r) => sum + (Number(r.belanja_non_pengadaan) || 0),
      0,
    );
    const belanjaModal = rupSa.reduce((sum, r) => sum + (Number(r.belanja_modal) || 0), 0);
    const totalBelanja = rupSa.reduce((sum, r) => sum + (Number(r.total_belanja) || 0), 0);

    const totalRup = rupPenyedia + rupSwakelola;
    const selisih = belanjaPengadaan - totalRup;
    const totalPaket = totalPaketPenyedia + totalPaketSwakelola;
    const persen =
      belanjaPengadaan !== 0
        ? `${Math.round((totalRup / belanjaPengadaan) * 100 * 100) / 100}%`
        : '0%';

    const result: RupSummaryResult = {
      nama_satker: 'Semua Perangkat Daerah',
      tahun: year,
      rup_penyedia: rupPenyedia,
      total_paket_penyedia: totalPaketPenyedia,
      rup_swakelola: rupSwakelola,
      total_paket_swakelola: totalPaketSwakelola,
      belanja_pengadaan: belanjaPengadaan,
      belanja_operasi: belanjaOperasi,
      belanja_non_pengadaan: belanjaNonPengadaan,
      belanja_modal: belanjaModal,
      total_belanja: totalBelanja,
      total_rup: totalRup,
      selisih,
      total_paket: totalPaket,
      persen,
      _generated_at: new Date().toISOString(),
    };

    const dirPath = path.join(this.exportBasePath, this.filesDir);
    await fs.mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, `rup_${year}.json`);
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`[Kiosk] RUP summary saved to ${filePath}`);
    return result;
  }

  async getKioskRup(year: number): Promise<RupSummaryResult> {
    const filePath = path.join(this.exportBasePath, this.filesDir, `rup_${year}.json`);

    if (!existsSync(filePath)) {
      throw new Error(`File rup_${year}.json belum ada. Jalankan compute-rup terlebih dahulu.`);
    }

    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as RupSummaryResult;
  }

  async getKioskTender(year: number): Promise<TenderSummaryResult> {
    const url = this.tenderUrl(year);

    console.log(`[Kiosk] Fetching tender data for year ${year}...`);

    const res = await axios.get<TenderRecord[]>(url, this.authConfig);
    const data = res.data;

    let totalPagu = 0;
    let totalHps = 0;
    let berlangsung = 0;
    let selesai = 0;
    let gagalBatal = 0;

    for (const row of data) {
      const status = (row.status_tender || '').trim().toLowerCase();
      if (status === 'berlangsung') berlangsung++;
      else if (status === 'selesai') selesai++;
      else if (status.includes('gagal') || status.includes('batal')) gagalBatal++;

      totalPagu += Number(row.pagu) || 0;
      totalHps += Number(row.hps) || 0;
    }

    return {
      satker: 'Semua Perangkat Daerah',
      tahun: year,
      total_tender: data.length,
      total_pagu: totalPagu,
      total_hps: totalHps,
      berlangsung,
      selesai,
      gagal_batal: gagalBatal,
    };
  }
}
