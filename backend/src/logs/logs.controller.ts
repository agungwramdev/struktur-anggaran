import { Controller, Get, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('logs')
@ApiBearerAuth('JWT-auth')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get activity logs' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of logs' })
  @ApiResponse({ status: 200, description: 'Returns activity logs' })
  findAll(@Query('limit') limit?: string, @Request() req?: any) {
    const user = req?.user;

    // Admin hanya bisa melihat log mereka sendiri
    if (user && user.role === 'admin') {
      return this.logsService.findByUser(user.userId);
    }

    // Superadmin bisa melihat semua log
    if (limit) {
      return this.logsService.findRecent(parseInt(limit));
    }
    return this.logsService.findAll();
  }

  @Get('user/:userId')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Get logs by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns user activity logs' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin can only view their own logs' })
  findByUser(@Param('userId') userId: string, @Request() req: any) {
    const user = req.user;

    // Admin hanya bisa melihat log mereka sendiri
    if (user.role === 'admin' && user.userId !== userId) {
      throw new ForbiddenException('You can only view your own logs');
    }

    return this.logsService.findByUser(userId);
  }
}
