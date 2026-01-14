import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from '../schemas/log.schema';

interface CreateLogDto {
  user_id: string;
  aktifitas: string;
  keterangan?: string;
}

@Injectable()
export class LogsService {
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  async create(createLogDto: CreateLogDto): Promise<Log> {
    const createdLog = new this.logModel(createLogDto);
    return createdLog.save();
  }

  async findAll(): Promise<Log[]> {
    return this.logModel.find().populate('user_id', 'username nama email').sort({ createdAt: -1 }).exec();
  }

  async findByUser(userId: string): Promise<Log[]> {
    return this.logModel
      .find({ user_id: userId })
      .populate('user_id', 'username nama email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findRecent(limit: number = 50): Promise<Log[]> {
    return this.logModel
      .find()
      .populate('user_id', 'username nama email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
