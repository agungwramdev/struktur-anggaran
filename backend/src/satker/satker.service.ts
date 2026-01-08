import { Injectable } from '@nestjs/common';
import axios from 'axios';

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
    try {
      const url = `https://data.pbj.my.id/rup/D197/RUP-MasterSatker/${tahun}/data.json`;

      console.log(`Fetching satker data from: ${url}`);

      const response = await axios.get(url, {
        auth: {
          username: process.env.PBJ_API_USERNAME || 'admin',
          password: process.env.PBJ_API_PASSWORD || 'tetapsemangat',
        },
      });

      const records: SatkerData[] = response.data.map((record: any) => ({
        kd_klpd: record.kd_klpd || '',
        nama_klpd: record.nama_klpd || '',
        kd_satker: record.kd_satker || '',
        kd_satker_str: record.kd_satker_str || '',
        nama_satker: record.nama_satker || '',
      }));

      console.log(`Successfully fetched ${records.length} satker records for year ${tahun}`);
      return records;
    } catch (error) {
      console.error('Error fetching Satker data:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to fetch Satker data: ${error.message}`);
    }
  }

  async getSatkerByKode(tahun: number, kdSatker: string): Promise<SatkerData | null> {
    const data = await this.fetchSatkerData(tahun);
    return data.find((satker) => satker.kd_satker === kdSatker) || null;
  }
}
