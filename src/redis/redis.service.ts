// redis-cache.service.ts
import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number) {
    const stringified = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.set(key, stringified, { EX: ttlSeconds });
    } else {
      await this.redis.set(key, stringified);
    }
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async deleteByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let deletedCount = 0;

    do {
      const result = await this.redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = result.cursor.toString();
      const keys = result.keys;

      if (keys.length > 0) {
        await this.redis.del(keys);
        deletedCount += keys.length;
      }
    } while (cursor !== '0');

    return deletedCount;
  }
}
