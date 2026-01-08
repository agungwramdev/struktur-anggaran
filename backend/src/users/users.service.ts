import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private logsService: LogsService,
  ) {}

  async create(createUserDto: CreateUserDto, createdBy?: string): Promise<User> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email: createUserDto.email }, { username: createUserDto.username }],
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await createdUser.save();

    if (createdBy) {
      await this.logsService.create({
        user_id: createdBy,
        aktifitas: 'Create User',
        keterangan: `Created user ${createUserDto.username}`,
      });
    }

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy?: string): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    if (updatedBy) {
      await this.logsService.create({
        user_id: updatedBy,
        aktifitas: 'Update User',
        keterangan: `Updated user ${updatedUser.username}`,
      });
    }

    return updatedUser;
  }

  async remove(id: string, deletedBy?: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.findByIdAndDelete(id).exec();

    if (deletedBy) {
      await this.logsService.create({
        user_id: deletedBy,
        aktifitas: 'Delete User',
        keterangan: `Deleted user ${user.username}`,
      });
    }
  }

  async seedSuperAdmin(): Promise<void> {
    const existingSuperAdmin = await this.userModel.findOne({ role: 'superadmin' });
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const superAdmin = new this.userModel({
        email: 'superadmin@struktur-anggaran.com',
        username: 'superadmin',
        password: hashedPassword,
        nama: 'Super Administrator',
        role: 'superadmin',
        status: 'active',
      });
      await superAdmin.save();
      console.log('Super admin created successfully');
    }
  }
}
