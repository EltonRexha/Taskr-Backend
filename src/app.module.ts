import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ClerkModule } from './clerk/clerk.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { AbilitiesGuard } from './casl/guards/abilities.guard';
import { CaslModule } from './casl/casl.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

const CACHABLE_MEMORY_TTL_MS = 10000; // 10 seconds
const CACHABLE_MEMORY_LRU_SIZE = 5000; // Max 5000 items in LRU cache
const REDIS_TTL_MS = 60000; // 60 seconds

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({
                ttl: CACHABLE_MEMORY_TTL_MS,
                lruSize: CACHABLE_MEMORY_LRU_SIZE,
              }),
              ttl: CACHABLE_MEMORY_TTL_MS,
            }),

            new Keyv({
              store: new KeyvRedis(process.env.REDIS_URL as string),
              ttl: REDIS_TTL_MS,
            }),
          ],
        };
      },
    }),
    UsersModule,
    DatabaseModule,
    WebhooksModule,
    ClerkModule,
    ProjectsModule,
    TasksModule,
    AuthModule,
    CaslModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AbilitiesGuard,
    },
  ],
})
export class AppModule {}
