import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccessLog } from './entities/user-access-log.entity';

@Injectable()
export class UserAccessLogsService {
  constructor(
    @InjectRepository(UserAccessLog)
    private userAccessLogRepository: Repository<UserAccessLog>,
  ) {}

  async createLog(
    userId: string,
    ipAddress: string,
    userAgent: string,
    endpoint: string,
    method: string,
    statusCode: number = 200,
    responseTime: number = 0,
    referer?: string,
    sessionId?: string,
  ): Promise<UserAccessLog> {
    const log = this.userAccessLogRepository.create({
      userId,
      ipAddress,
      userAgent,
      endpoint,
      method,
      statusCode,
      responseTime,
      referer,
      sessionId,
    });

    return await this.userAccessLogRepository.save(log);
  }

  async getLastAccess(userId: string): Promise<UserAccessLog | null> {
    return await this.userAccessLogRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserAccessHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ logs: UserAccessLog[]; total: number }> {
    const [logs, total] = await this.userAccessLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { logs, total };
  }

  async getAccessStats(userId: string, days: number = 30): Promise<{
    totalAccesses: number;
    uniqueDays: number;
    averageResponseTime: number;
    lastAccess: Date | null;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.userAccessLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt >= :since', { since })
      .getMany();

    const totalAccesses = logs.length;
    const uniqueDays = new Set(
      logs.map(log => log.createdAt.toDateString())
    ).size;
    const averageResponseTime = logs.length > 0 
      ? logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length 
      : 0;
    const lastAccess = logs.length > 0 
      ? logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt 
      : null;

    return {
      totalAccesses,
      uniqueDays,
      averageResponseTime: Math.round(averageResponseTime),
      lastAccess,
    };
  }
}
