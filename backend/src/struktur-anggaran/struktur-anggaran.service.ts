import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StrukturAnggaran, StrukturAnggaranDocument } from '../schemas/struktur-anggaran.schema';
import { CreateStrukturAnggaranDto } from '../dto/create-struktur-anggaran.dto';
import { UpdateStrukturAnggaranDto } from '../dto/update-struktur-anggaran.dto';
import { LogsService } from '../logs/logs.service';
import { FileExportService } from '../file-export/file-export.service';

@Injectable()
export class StrukturAnggaranService {
  constructor(
    @InjectModel(StrukturAnggaran.name)
    private strukturAnggaranModel: Model<StrukturAnggaranDocument>,
    private logsService: LogsService,
    private fileExportService: FileExportService,
  ) {}

  async create(
    createStrukturAnggaranDto: CreateStrukturAnggaranDto,
    userId?: string,
  ): Promise<StrukturAnggaran> {
    // Check if satker already exists for this year
    const existingData = await this.strukturAnggaranModel.findOne({
      kd_satker: createStrukturAnggaranDto.kd_satker,
      tahun_anggaran: createStrukturAnggaranDto.tahun_anggaran,
    }).exec();

    if (existingData) {
      throw new ConflictException(
        `Data untuk satker ${createStrukturAnggaranDto.nama_satker} tahun ${createStrukturAnggaranDto.tahun_anggaran} sudah ada. Satu satker hanya boleh memiliki satu data per tahun.`
      );
    }

    const createdData = new this.strukturAnggaranModel(createStrukturAnggaranDto);
    const savedData = await createdData.save();

    if (userId) {
      await this.logsService.create({
        user_id: userId,
        aktifitas: 'Create Struktur Anggaran',
        keterangan: `Created struktur anggaran for ${createStrukturAnggaranDto.nama_satker} - ${createStrukturAnggaranDto.tahun_anggaran}`,
      });
    }

    this.fileExportService.scheduleExport(createStrukturAnggaranDto.tahun_anggaran);
    return savedData;
  }

  async findAll(tahun?: number): Promise<StrukturAnggaran[]> {
    const filter = tahun ? { tahun_anggaran: tahun } : {};
    return this.strukturAnggaranModel.find(filter).sort({ tahun_anggaran: -1, nama_satker: 1 }).exec();
  }

  async findById(id: string): Promise<StrukturAnggaran> {
    const data = await this.strukturAnggaranModel.findById(id).exec();
    if (!data) {
      throw new NotFoundException('Struktur anggaran not found');
    }
    return data;
  }

  async findByTahun(tahun: number): Promise<StrukturAnggaran[]> {
    return this.strukturAnggaranModel.find({ tahun_anggaran: tahun }).sort({ nama_satker: 1 }).exec();
  }

  async findBySatker(kdSatker: string, tahun?: number): Promise<StrukturAnggaran[]> {
    const filter: any = { kd_satker: kdSatker };
    if (tahun) {
      filter.tahun_anggaran = tahun;
    }
    return this.strukturAnggaranModel.find(filter).sort({ tahun_anggaran: -1 }).exec();
  }

  async update(
    id: string,
    updateStrukturAnggaranDto: UpdateStrukturAnggaranDto,
    userId?: string,
  ): Promise<StrukturAnggaran> {
    const updatedData = await this.strukturAnggaranModel
      .findByIdAndUpdate(id, updateStrukturAnggaranDto, { new: true })
      .exec();

    if (!updatedData) {
      throw new NotFoundException('Struktur anggaran not found');
    }

    if (userId) {
      await this.logsService.create({
        user_id: userId,
        aktifitas: 'Update Struktur Anggaran',
        keterangan: `Updated struktur anggaran for ${updatedData.nama_satker} - ${updatedData.tahun_anggaran}`,
      });
    }

    this.fileExportService.scheduleExport(updatedData.tahun_anggaran);
    return updatedData;
  }

  async remove(id: string, userId?: string): Promise<void> {
    const data = await this.strukturAnggaranModel.findById(id).exec();
    if (!data) {
      throw new NotFoundException('Struktur anggaran not found');
    }

    await this.strukturAnggaranModel.findByIdAndDelete(id).exec();

    if (userId) {
      await this.logsService.create({
        user_id: userId,
        aktifitas: 'Delete Struktur Anggaran',
        keterangan: `Deleted struktur anggaran for ${data.nama_satker} - ${data.tahun_anggaran}`,
      });
    }

    this.fileExportService.scheduleExport(data.tahun_anggaran);
  }

  async getStatistics(tahun?: number): Promise<any> {
    const filter = tahun ? { tahun_anggaran: tahun } : {};
    const data = await this.strukturAnggaranModel.find(filter).exec();

    const totalBelanja = data.reduce((sum, item) => sum + item.total_belanja, 0);
    const totalBelanjaOperasi = data.reduce((sum, item) => sum + item.belanja_operasi, 0);
    const totalBelanjaModal = data.reduce((sum, item) => sum + item.belanja_modal, 0);
    const totalBelanjaBBT = data.reduce((sum, item) => sum + item.belanja_bbt, 0);
    const totalBelanjaPengadaan = data.reduce((sum, item) => sum + item.belanja_pengadaan, 0);
    const totalBelanjaNonPengadaan = data.reduce((sum, item) => sum + item.belanja_non_pengadaan, 0);

    return {
      totalSatker: data.length,
      totalBelanja,
      totalBelanjaOperasi,
      totalBelanjaModal,
      totalBelanjaBBT,
      totalBelanjaPengadaan,
      totalBelanjaNonPengadaan,
    };
  }

  async getUsedSatkerCodes(tahun: number): Promise<string[]> {
    const data = await this.strukturAnggaranModel
      .find({ tahun_anggaran: tahun })
      .select('kd_satker')
      .exec();
    return data.map(item => item.kd_satker);
  }
}
