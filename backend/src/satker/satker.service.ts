import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as parquet from 'parquetjs';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface SatkerData {
  kd_klpd: string;
  nama_klpd: string;
  kd_satker: string;
  kd_satker_str: string;
  nama_satker: string;
}

@Injectable()
export class SatkerService {
  async fetchSatkerData(tahun: number): Promise<SatkerData[]> {
    let tempFilePath: string | null = null;

    try {
      const url = `https://data.pbj.my.id/inaproc/rup/D197/RUP-Master-Satker/${tahun}/data.parquet`;

      console.log(`[Satker] Fetching satker data from: ${url}`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        auth: {
          username: process.env.PBJ_API_USERNAME || 'admin',
          password: process.env.PBJ_API_PASSWORD || 'tetapsemangat',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log(`[Satker] Response received, size: ${response.data.byteLength} bytes`);
      console.log(`[Satker] Starting parquet parsing...`);

      // Write buffer to temporary file
      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `satker-${tahun}-${Date.now()}.parquet`);
      fs.writeFileSync(tempFilePath, Buffer.from(response.data));
      console.log(`[Satker] Temporary file created: ${tempFilePath}`);

      // Read parquet file
      const reader = await parquet.ParquetReader.openFile(tempFilePath);
      const cursor = reader.getCursor();
      const records: SatkerData[] = [];

      console.log(`[Satker] Parquet reader created, reading records...`);

      let record = null;
      let count = 0;
      while ((record = await cursor.next())) {
        records.push({
          kd_klpd: String(record.kd_klpd || ''),
          nama_klpd: String(record.nama_klpd || ''),
          kd_satker: String(record.kd_satker || ''),
          kd_satker_str: String(record.kd_satker_str || ''),
          nama_satker: String(record.nama_satker || ''),
        });
        count++;
        if (count % 100 === 0) {
          console.log(`[Satker] Processed ${count} records...`);
        }
      }

      await reader.close();
      console.log(`[Satker] ✅ Successfully fetched ${records.length} satker records for year ${tahun}`);

      // Clean up temporary file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(`[Satker] Temporary file deleted`);
      }

      return records;
    } catch (error) {
      console.error('[Satker] ❌ Error fetching Satker data:', error.message);
      console.error('[Satker] Error stack:', error.stack);
      if (error.response) {
        console.error('[Satker] Response status:', error.response.status);
        console.error('[Satker] Response data:', error.response.data);
      }

      // Clean up temporary file on error
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
          console.log(`[Satker] Temporary file deleted (cleanup after error)`);
        } catch (cleanupError) {
          console.error('[Satker] Failed to cleanup temp file:', cleanupError.message);
        }
      }

      throw new Error(`Failed to fetch Satker data: ${error.message}`);
    }
  }

  async getSatkerByKode(tahun: number, kdSatker: string): Promise<SatkerData | null> {
    const data = await this.fetchSatkerData(tahun);
    return data.find((satker) => satker.kd_satker === kdSatker) || null;
  }
}
