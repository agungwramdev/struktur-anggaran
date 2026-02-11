import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StrukturAnggaranModule } from './struktur-anggaran/struktur-anggaran.module';
import { LogsModule } from './logs/logs.module';
import { SatkerModule } from './satker/satker.module';
import { Rup31MaretModule } from './rup-31-maret/rup-31-maret.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time window: 60 seconds
      limit: 10, // Max 10 requests per window
    }]),
    AuthModule,
    UsersModule,
    StrukturAnggaranModule,
    LogsModule,
    SatkerModule,
    Rup31MaretModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
