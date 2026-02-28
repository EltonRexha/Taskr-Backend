import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisCacheService } from './redis.service';

/*
    This module provides a Redis client and a caching service that can be used in the DB level.
*/

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: process.env.REDIS_URL,
        });

        await client.connect();
        return client;
      },
    },
    RedisCacheService,
  ],
  exports: ['REDIS_CLIENT', RedisCacheService],
})
export class RedisModule {}
