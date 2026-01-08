import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StrukturAnggaranModule } from './struktur-anggaran/struktur-anggaran.module';
import { LogsModule } from './logs/logs.module';
import { SatkerModule } from './satker/satker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    UsersModule,
    StrukturAnggaranModule,
    LogsModule,
    SatkerModule,
  ],
})
export class AppModule {}
